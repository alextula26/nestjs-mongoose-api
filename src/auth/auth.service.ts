import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { DeviceRepository } from '../device/device.repository';
import { UserDocument } from '../user/schemas';
import { validateOrRejectModel } from '../validate';
import { AuthUserDto, RegistrationUserDto } from './dto';
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
    // Обновляем accessToken, refreshToken и дату истекания срока refreshToken
    const authTokens = await user.generateAuthTokens(user.id, device.deviceId);
    // Если возникла ошибка в формировании токенов, то вернем null для возрвата 401 ошибки
    if (!authTokens) {
      return null;
    }
    const { accessToken, refreshToken, expRefreshToken } = authTokens;
    // Обновляем refreshToken пользователя
    user.updateRefreshToken(refreshToken);
    // Сохраняем пользователя в базе
    await this.userRepository.save(user);
    // Обновляем дату у устройства
    device.updateLastActiveDate(new Date(expRefreshToken).toISOString());
    // Сохраняем устройство в базе
    await this.deviceRepository.save(device);

    return { accessToken, refreshToken };
  }
  async registerUser(registrationUserDto: RegistrationUserDto): Promise<{
    statusCode: HttpStatus;
    statusMessage: string;
  }> {
    await validateOrRejectModel(registrationUserDto, RegistrationUserDto);

    const { login, password, email } = registrationUserDto;
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
        statusMessage: `User creation error`,
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
        statusMessage: 'User registered',
      };
    } catch (error) {
      // Если письмо не отправилось, то удаляем добавленного пользователя
      await this.userRepository.deleteUserById(foundRegisteredUser.id);
      // Возвращаем ошибку
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: `User creation error`,
      };
    }
  }
}
