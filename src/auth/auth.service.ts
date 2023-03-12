import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { DeviceRepository } from '../device/device.repository';
import { UserDocument } from '../user/schemas';
import { validateOrRejectModel } from '../validate';
import {
  AuthUserDto,
  ConfirmPasswordDto,
  RegistrationConfirmationDto,
  RegistrationEmailDto,
  RegistrationUserDto,
} from './dto';
import { getNextStrId } from '../utils';
import { EmailManager } from '../managers';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly deviceRepository: DeviceRepository,
    private readonly emailManager: EmailManager,
  ) {}
  // Поиск документа конкретного пользователя по его идентификатору
  async findUserById(userId: string): Promise<UserDocument | null> {
    // Ищем пользователя по идентификатору, если пользователь не найден, то Middleware вернет статус 401
    const foundUser = await this.userRepository.findUserById(userId);
    // Если пользователь по идентификатору не найден, возвращаем статус 401
    if (!foundUser) {
      return null;
    }

    return foundUser;
  }
  // Аутентификация пользователя
  async checkCredentials(
    ip: string,
    deviceTitle: string,
    authUserDto: AuthUserDto,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    // Валидируем DTO
    await validateOrRejectModel(authUserDto, AuthUserDto);
    // Получаем loginOrEmail, password из DTO
    const { loginOrEmail, password } = authUserDto;
    // Ищем пользователя по логину или емайлу
    const user = await this.userRepository.findByLoginOrEmail(loginOrEmail);
    // Если пользователь не найден, то вернем null для возрвата 401 ошибки
    if (!user) {
      return null;
    }
    // Проверка учетных данных по паролю
    const isCheckCredentialsUser = await user.isCheckCredentials(password);
    // Если пароль не верен, то вернем null для возрвата 401 ошибки
    if (!isCheckCredentialsUser) {
      return null;
    }
    // Формируем id устройства
    const deviceId = getNextStrId();
    // Формируем accessToken, refreshToken и дату истекания срока refreshToken
    const authTokens = await user.generateAuthTokens(user.id, deviceId);
    // Если возникла ошибка в формировании токенов, то вернем null для возрвата 401 ошибки
    if (!authTokens) {
      return null;
    }
    const { accessToken, refreshToken, expRefreshToken } = authTokens;
    // Создаем документ устройства
    const madeDevice = await this.deviceRepository.createDevice({
      deviceId,
      ip: ip,
      title: deviceTitle,
      lastActiveDate: new Date(expRefreshToken).toISOString(),
      userId: user.id,
    });
    // Сохраняем устройство в базе
    await this.deviceRepository.save(madeDevice);
    // Обновляем refreshToken пользователя
    user.updateRefreshToken(refreshToken);
    // Сохраняем пользователя в базе
    await this.userRepository.save(user);
    // Возвращаем accessToken
    return { accessToken, refreshToken };
  }
  // Выход пользователя из системы
  async logout(
    userId: string,
    deviceId: string,
  ): Promise<{ statusCode: HttpStatus; statusMessage: string }> {
    // Ищем пользователя по его идентификатору
    const user = await this.userRepository.findUserById(userId);
    // Ищем устройство пользователя по его идентификатору
    const device = await this.deviceRepository.findDeviceById(deviceId);
    // Если пользователь не найден, то вернем null для возрвата 401 ошибки
    if (!user || !device) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        statusMessage: 'FORBIDDEN',
      };
    }
    // Обновляем refreshToken пользователя
    user.updateRefreshToken('');
    // Сохраняем пользователя в базе
    await this.userRepository.save(user);
    // Удаляем устройство
    await this.deviceRepository.deleteDeviceById(device.deviceId, user.id);

    return {
      statusCode: HttpStatus.NO_CONTENT,
      statusMessage: 'Logout',
    };
  }
  // Получение access токена и refresh токена
  async refreshToken(
    userId: string,
    deviceId: string,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    // Ищем пользователя по его идентификатору
    const user = await this.userRepository.findUserById(userId);
    // Ищем устройство пользователя по его идентификатору
    const device = await this.deviceRepository.findDeviceById(deviceId);
    // Если пользователь не найден, то вернем null для возрвата 401 ошибки
    if (!user || !device) {
      return null;
    }
    // Обновляем access токен, refresh токен и дату истекания срока refreshToken
    const authTokens = await user.generateAuthTokens(user.id, device.deviceId);
    // Если возникла ошибка в формировании токенов, то вернем null для возрвата 401 ошибки
    if (!authTokens) {
      return null;
    }
    const { accessToken, refreshToken, expRefreshToken } = authTokens;
    // Обновляем refresh токен пользователя
    user.updateRefreshToken(refreshToken);
    // Сохраняем пользователя в базе
    await this.userRepository.save(user);
    // Обновляем дату у устройства
    device.updateLastActiveDate(new Date(expRefreshToken).toISOString());
    // Сохраняем устройство в базе
    await this.deviceRepository.save(device);

    return { accessToken, refreshToken };
  }
  // Регистрация пользователя
  async registerUser(registrationUserDto: RegistrationUserDto): Promise<{
    statusCode: HttpStatus;
    statusMessage: [{ message: string; field?: string }];
  }> {
    await validateOrRejectModel(registrationUserDto, RegistrationUserDto);

    const { login, password, email } = registrationUserDto;
    // Проверяем добавлен ли пользователь с переданным логином
    const foundUserByLogin = await this.userRepository.findByLoginOrEmail(
      login,
    );
    // Если пользователь с переданным логином уже добавлен в базе, возвращаем ошибку 400
    if (foundUserByLogin) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          {
            message: `The user is already registered in the system`,
            field: 'login',
          },
        ],
      };
    }
    // Проверяем добавлен ли пользователь с переданным email
    const foundUserByEmail = await this.userRepository.findByLoginOrEmail(
      email,
    );
    // Если пользователь с переданным email уже добавлен в базе, возвращаем ошибку 400
    if (foundUserByEmail) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          {
            message: `The user is already registered in the system`,
            field: 'email',
          },
        ],
      };
    }
    // Создаем документ пользователя
    const madeUser = await this.userRepository.createUser({
      login,
      password,
      email,
    });
    // Сохраняем пользователя в базе
    const registeredUser = await this.userRepository.save(madeUser);
    // Ищем созданного пользователя в базе
    const foundRegisteredUser = await this.userRepository.findUserById(
      registeredUser.id,
    );
    // Если пользователя нет, т.е. он не сохранился, возвращаем ошибку
    if (!foundRegisteredUser) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [{ message: 'User creation error' }],
      };
    }

    try {
      // Отправляем код подтверждения email
      await this.emailManager.sendEmailCreatedUser(
        foundRegisteredUser.accountData.email,
        foundRegisteredUser.emailConfirmation.confirmationCode,
      );

      return {
        statusCode: HttpStatus.NO_CONTENT,
        statusMessage: [{ message: 'User registered' }],
      };
    } catch (error) {
      // Если письмо не отправилось, то удаляем добавленного пользователя
      await this.userRepository.deleteUserById(foundRegisteredUser.id);
      // Возвращаем ошибку
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [{ message: 'User creation error' }],
      };
    }
  }
  async registrationConfirmation(
    registrationConfirmationDto: RegistrationConfirmationDto,
  ): Promise<{
    statusCode: HttpStatus;
    statusMessage: [{ message: string; field?: string }];
  }> {
    await validateOrRejectModel(
      registrationConfirmationDto,
      RegistrationConfirmationDto,
    );
    // Получаем код из DTO
    const { code } = registrationConfirmationDto;
    // Ищем пользователя по коду подтверждения email
    const user = await this.userRepository.findByConfirmationCode(code);
    // Если пользователь по коду подтверждения email не найден, возвращаем ошибку 400
    if (!user) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          {
            message: 'The user is not registered in the system',
            field: 'code',
          },
        ],
      };
    }
    // Если дата для подтверждения email по коду просрочена
    // Если email уже подтвержден
    // Возвращаем ошибку
    if (!user.canBeConfirmed()) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          {
            message: 'Code is incorrectly',
            field: 'code',
          },
        ],
      };
    }
    // Обновляем признак подтвержения
    user.confirm();
    // Обновляем пользователя в базе
    await this.userRepository.save(user);

    return {
      statusCode: HttpStatus.NO_CONTENT,
      statusMessage: [{ message: 'Registration confirmation done' }],
    };
  }
  // Повторная отправка кода подтверждения аккаунта на email
  async registrationEmailResending(
    registrationEmailDto: RegistrationEmailDto,
  ): Promise<{
    statusCode: HttpStatus;
    statusMessage: [{ message: string; field?: string }];
  }> {
    await validateOrRejectModel(registrationEmailDto, RegistrationEmailDto);
    // Получаем код из DTO
    const { email } = registrationEmailDto;
    // Ищем пользователя по email
    const user = await this.userRepository.findByLoginOrEmail(email);
    // Если пользователь по email не найден, возвращаем ошибку 400
    if (!user) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          {
            message: 'The user is not registered in the system',
            field: 'email',
          },
        ],
      };
    }
    // Если дата для подтверждения email по коду просрочена
    // Если email уже подтвержден
    // Возвращаем ошибку
    if (!user.canBeConfirmed()) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          {
            message: `Account can't be confirm!`,
            field: 'email',
          },
        ],
      };
    }
    // Обновляем кода подтверждения аккаунта
    user.updateConfirmationCode();
    // Обновляем пользователя в базе
    const updatedUser = await this.userRepository.save(user);
    // Отправляем письмо с новым кодом подтверждения аккаунта
    try {
      // Если обновление кода подтверждения email прошло успешно, отправляем письмо
      await this.emailManager.sendEmailCreatedUser(
        email,
        updatedUser.emailConfirmation.confirmationCode,
      );
      // Возвращаем результат обнорвления кода подтверждения email
      return {
        statusCode: HttpStatus.NO_CONTENT,
        statusMessage: [
          { message: 'The update confirmation code has been executed' },
        ],
      };
    } catch (error) {
      // Если письмо по какой-либо причине не было отправлено
      // Возвращаем ошибку
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          { message: 'The update confirmation code has not been executed' },
        ],
      };
    }
  }
  // Отправка кода для востановления пароля
  async passwordRecovery(registrationEmailDto: RegistrationEmailDto): Promise<{
    statusCode: HttpStatus;
    statusMessage: [{ message: string; field?: string }];
  }> {
    await validateOrRejectModel(registrationEmailDto, RegistrationEmailDto);
    // Получаем код из DTO
    const { email } = registrationEmailDto;
    // Ищем пользователя по email
    const user = await this.userRepository.findByLoginOrEmail(email);
    // Если пользователь по email не найден, возвращаем ошибку 400
    if (!user) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          {
            message: 'The user is not registered in the system',
            field: 'email',
          },
        ],
      };
    }
    // Обновляем код востановления пароля
    user.updateRecoveryCodeByEmail();
    // Обновляем пользователя в базе
    const updatedUser = await this.userRepository.save(user);
    // Отправляем письмо с новым кодом востановления пароля
    try {
      // Если обновление кода востановления пароля прошло успешно, отправляем письмо
      await this.emailManager.sendEmailWithRecoveryCode(
        email,
        updatedUser.passwordRecovery.recoveryCode,
      );
      // Возвращаем результат обнорвления кода востановления пароля
      return {
        statusCode: HttpStatus.NO_CONTENT,
        statusMessage: [
          { message: 'The update recovery code has been executed' },
        ],
      };
    } catch (error) {
      // Если письмо по какой-либо причине не было отправлено
      // Возвращаем ошибку
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          { message: 'The update recovery code has not been executed' },
        ],
      };
    }
  }
  // Повторная отправка кода подтверждения аккаунта на email
  async newPassword(confirmPasswordDto: ConfirmPasswordDto): Promise<{
    statusCode: HttpStatus;
    statusMessage: [{ message: string; field?: string }];
  }> {
    await validateOrRejectModel(confirmPasswordDto, ConfirmPasswordDto);
    // Получаем код востановления пароля и новый пароль из DTO
    const { recoveryCode, newPassword } = confirmPasswordDto;
    // Ищем пользователя по коду востановления пароля
    const user = await this.userRepository.findByRecoveryCode(recoveryCode);
    // Если пользователь по коду востановления пароля не найден, возвращаем ошибку 400
    if (!user) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          {
            message: 'The user is not registered in the system',
            field: 'recoveryCode',
          },
        ],
      };
    }
    // Если дата для востановления пароля по коду просрочена
    // Если пароль уже востановлен
    // Возвращаем ошибку
    if (!user.canBePasswordRecovery()) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          {
            message: `The password cannot be restored`,
            field: 'recoveryCode',
          },
        ],
      };
    }
    // Обновляем пароль пользователя
    await user.updatePassword(newPassword);
    // Обновляем пользователя в базе
    await this.userRepository.save(user);

    return {
      statusCode: HttpStatus.NO_CONTENT,
      statusMessage: [{ message: 'The password has been restored' }],
    };
  }
}
