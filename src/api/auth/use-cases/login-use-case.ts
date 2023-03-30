import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { validateOrRejectModel } from '../../../validate';
import { getNextStrId } from '../../../utils';

import { UserRepository } from '../../user/user.repository';
import { DeviceRepository } from '../../device/device.repository';

import { AuthUserDto } from '../dto';

export class LoginCommand {
  constructor(
    public ip: string,
    public deviceTitle: string,
    public authUserDto: AuthUserDto,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly deviceRepository: DeviceRepository,
  ) {}
  // Аутентификация пользователя
  async execute(
    command: LoginCommand,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const { ip, deviceTitle, authUserDto } = command;
    // Валидируем DTO
    await validateOrRejectModel(authUserDto, AuthUserDto);
    // Получаем loginOrEmail, password из DTO
    const { loginOrEmail, password } = authUserDto;
    // Ищем пользователя по логину или емайлу
    const user = await this.userRepository.findByLoginOrEmail(loginOrEmail);
    // Если пользователь не найден, то вернем null для возрвата 401 ошибки
    if (!user || user.checkUserBanned()) {
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
    const { accessToken, refreshToken, iatRefreshToken } = authTokens;
    // Создаем документ устройства
    const madeDevice = await this.deviceRepository.createDevice({
      deviceId,
      ip: ip,
      title: deviceTitle,
      lastActiveDate: new Date(iatRefreshToken).toISOString(),
      userId: user.id,
    });
    // Сохраняем устройство в базе
    await this.deviceRepository.save(madeDevice);
    // Обновляем refreshToken пользователя
    user.updateRefreshToken(refreshToken);
    // Сохраняем пользователя в базе
    await this.userRepository.save(user);
    // Возвращаем access и refresh токены
    return { accessToken, refreshToken };
  }
}
