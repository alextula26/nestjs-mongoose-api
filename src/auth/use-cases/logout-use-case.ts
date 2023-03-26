import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserRepository } from '../../user/user.repository';
import { DeviceRepository } from '../../device/device.repository';

export class LogoutCommand {
  constructor(
    public userId: string,
    public deviceId: string,
    public deviceIat: string,
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly deviceRepository: DeviceRepository,
  ) {}
  // Logout пользователя
  async execute(command: LogoutCommand): Promise<{ statusCode: HttpStatus }> {
    const { userId, deviceId, deviceIat } = command;
    // Ищем пользователя по его идентификатору
    const user = await this.userRepository.findUserById(userId);
    // Ищем устройство пользователя по его идентификатору
    const device = await this.deviceRepository.findDeviceById(deviceId);
    // Если пользователь не найден, возвращаем ошибку 401
    if (!user || !device) {
      return { statusCode: HttpStatus.UNAUTHORIZED };
    }
    // Если даты создания устройства не совпадают, возвращаем ошибку 401
    if (deviceIat !== device.lastActiveDate) {
      return { statusCode: HttpStatus.UNAUTHORIZED };
    }
    // Очищаем refreshToken пользователя
    user.updateRefreshToken('');
    // Сохраняем пользователя в базе
    await this.userRepository.save(user);
    // Удаляем устройство
    await this.deviceRepository.deleteDeviceById(device.deviceId, user.id);
    // Возвращаем статус 204
    return { statusCode: HttpStatus.NO_CONTENT };
  }
}
