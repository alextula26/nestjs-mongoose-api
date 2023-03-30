import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserRepository } from '../../user/user.repository';
import { DeviceRepository } from '../../device/device.repository';

export class RefreshTokenCommand {
  constructor(
    public userId: string,
    public deviceId: string,
    public deviceIat: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly deviceRepository: DeviceRepository,
  ) {}
  // Получение access и refresh токена
  async execute(
    command: RefreshTokenCommand,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const { userId, deviceId, deviceIat } = command;
    // Ищем пользователя по его идентификатору
    const user = await this.userRepository.findUserById(userId);
    // Ищем устройство пользователя по его идентификатору
    const device = await this.deviceRepository.findDeviceById(deviceId);
    // Если пользователь не найден, то вернем null для возрвата 401 ошибки
    if (!user || !device) {
      return null;
    }
    // Если даты создания устройства не совпадают, возвращаем ошибку 401
    if (deviceIat !== device.lastActiveDate) {
      return null;
    }
    // Обновляем access токен, refresh токен и дату истекания срока refreshToken
    const authTokens = await user.generateAuthTokens(user.id, device.deviceId);
    // Если возникла ошибка в формировании токенов, то вернем null для возрвата 401 ошибки
    if (!authTokens) {
      return null;
    }
    const { accessToken, refreshToken, iatRefreshToken } = authTokens;
    // Обновляем refresh токен пользователя
    user.updateRefreshToken(refreshToken);
    // Сохраняем пользователя в базе
    await this.userRepository.save(user);
    // Обновляем дату у устройства
    device.updateLastActiveDate(new Date(iatRefreshToken).toISOString());
    // Сохраняем устройство в базе
    await this.deviceRepository.save(device);
    // Возвращаем access и refresh токены
    return { accessToken, refreshToken };
  }
}
