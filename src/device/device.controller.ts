import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuardRefreshToken } from '../auth.guard';
import { DeviceQueryRepository } from './device.query.repository';
import { DeviceService } from './device.service';
import { DeviceViewModel } from './types';

@UseGuards(AuthGuardRefreshToken)
@Controller('api/security/devices')
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly deviceQueryRepository: DeviceQueryRepository,
  ) {}
  // Получение списка устройств
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllDevices(
    @Req() request: Request & { userId: string },
  ): Promise<DeviceViewModel[]> {
    // Получаем идентификатор пользователя
    const userId = request.userId;
    // Если идентификатор пользователя не определе, возвращаем ошибку 401
    if (!userId) {
      throw new UnauthorizedException();
    }
    // Получаем все устройства пользователя
    const allDevices = await this.deviceQueryRepository.findAllDevices(userId);
    // Возвращаем все устройства пользователя
    return allDevices;
  }
  // Удаление устройства
  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeviceById(
    @Param('deviceId') deviceId: string,
    @Req() request: Request & { userId: string },
  ): Promise<boolean> {
    // Получаем идентификатор пользователя
    const userId = request.userId;
    // Удаляем устройство
    const { statusCode, statusMessage } =
      await this.deviceService.deleteDeviceById(deviceId, userId);
    // Если при удалении устройства вернулась ошибка, возвращаем ее
    if (statusCode !== HttpStatus.NO_CONTENT) {
      throw new HttpException(statusMessage, statusCode);
    }
    // Иначе возвращаем true
    return true;
  }
  // Удаление всех устройств, кроме текущего устройства
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllDevices(
    @Req() request: Request & { userId: string; deviceId: string },
  ): Promise<boolean> {
    // Получаем идентификатор пользователя
    const userId = request.userId;
    // Получаем текущее устройство
    const currentDeviceId = request.deviceId;
    // Удаляем устройства
    const { statusCode, statusMessage } =
      await this.deviceService.deleteAllDevices(currentDeviceId, userId);
    // Если при удалении устройств вернулась ошибка, возвращаем ее
    if (statusCode !== HttpStatus.NO_CONTENT) {
      throw new HttpException(statusMessage, statusCode);
    }
    // Иначе возвращаем true
    return true;
  }
}
