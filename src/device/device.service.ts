import { HttpStatus, Injectable } from '@nestjs/common';
import { DeviceRepository } from './device.repository';
import { validateOrRejectModel } from '../validate';
import { CreateDeviceDto, UpdateLastActiveDateDeviceDto } from './dto';
import { isEmpty } from 'lodash';

@Injectable()
export class DeviceService {
  constructor(private readonly deviceRepository: DeviceRepository) {}
  async createDevice(createDeviceDto: CreateDeviceDto): Promise<{
    deviceId: string;
    statusCode: HttpStatus;
    statusMessage: string;
  }> {
    await validateOrRejectModel(createDeviceDto, CreateDeviceDto);

    const { deviceId, ip, title, userId, lastActiveDate } = createDeviceDto;
    // Создаем документ устройства
    const madeDevice = await this.deviceRepository.createDevice({
      deviceId,
      ip,
      title,
      userId,
      lastActiveDate,
    });
    // Сохраняем устройство в базе
    const createdDevice = await this.deviceRepository.save(madeDevice);
    // Ищем созданное устройство в базе
    const foundDevice = await this.deviceRepository.findDeviceById(
      createdDevice.id,
    );
    // Если устройства нет, т.е. он не сохранился в базе, возвращаем ошибку
    if (!foundDevice) {
      return {
        deviceId: null,
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: `Device creation error`,
      };
    }
    // Возвращаем идентификатор созданного устройства и статус CREATED
    return {
      deviceId: createdDevice.id,
      statusCode: HttpStatus.CREATED,
      statusMessage: 'Device created',
    };
  }
  // Удаление устройства
  async deleteDeviceById(
    deviceId: string,
    userId: string,
  ): Promise<{
    statusCode: HttpStatus;
    statusMessage: string;
  }> {
    // Если идентификатор пользователя не передан, возвращаем ошибку 401
    if (!userId) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        statusMessage: `The user ${userId} is unauthorized`,
      };
    }
    // Если идентификатор устройства не передан, возвращаем ошибку 404
    if (!deviceId) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        statusMessage: `Device with id ${deviceId} was not found`,
      };
    }
    // Ищем устройство по его идентификатору
    const foundDevice = await this.deviceRepository.findDeviceById(deviceId);
    // Если устройство не найдено, возвращаем ошибку 404
    if (isEmpty(foundDevice)) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        statusMessage: `Device with id ${deviceId} was not found`,
      };
    }
    // Если устройство пренадлежит другому пользователю возвращаем ошибку
    if (foundDevice.userId !== userId) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        statusMessage: `The device ${deviceId} cannot be deleted by a third-party user`,
      };
    }
    // Удаляем устройство
    const isDeletedDevice = await this.deviceRepository.deleteDeviceById(
      deviceId,
      userId,
    );
    // Если устройство не было удалено, возвращаем ошибку 404
    if (!isDeletedDevice) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        statusMessage: `Device with id ${deviceId} was not found`,
      };
    }
    return {
      statusCode: HttpStatus.NO_CONTENT,
      statusMessage: 'Device deleted',
    };
  }
  // Удаление всех устройств, кроме текущего устройства
  async deleteAllDevices(
    currentDeviceId: string,
    userId: string,
  ): Promise<{
    statusCode: HttpStatus;
    statusMessage: string;
  }> {
    if (!userId || !currentDeviceId) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        statusMessage: `The user ${userId} is unauthorized`,
      };
    }
    // Удаляем все устройства, кроме текущего устройства
    const isDeleteAllDevices = await this.deviceRepository.deleteAllDevices(
      currentDeviceId,
      userId,
    );
    // Если устройства не удалились, возвращаем ошибку
    if (!isDeleteAllDevices) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        statusMessage: `The Deviceы by user ${userId} could not be deleted`,
      };
    }

    return {
      statusCode: HttpStatus.NO_CONTENT,
      statusMessage: 'Devices deleted',
    };
  }
  async updateLastActiveDateDevice(
    deviceId: string,
    updateLastActiveDateDeviceDto: UpdateLastActiveDateDeviceDto,
  ): Promise<{
    statusCode: HttpStatus;
    statusMessage: string;
  }> {
    await validateOrRejectModel(
      updateLastActiveDateDeviceDto,
      UpdateLastActiveDateDeviceDto,
    );
    const { lastActiveDate } = updateLastActiveDateDeviceDto;
    // Ищем устройство в базе
    const foundDevice = await this.deviceRepository.findDeviceById(deviceId);
    // Если устройство не найдено, возвращаем ошибку
    if (isEmpty(foundDevice)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: `Device with id ${deviceId} was not found`,
      };
    }
    // Обновляем дату активности устройства
    foundDevice.updateLastActiveDate({
      lastActiveDate,
    });
    // Сохраняем обнволенное устрйоство в базу
    await this.deviceRepository.save(foundDevice);
    // Возвращаем статус NO_CONTENT
    return {
      statusCode: HttpStatus.NO_CONTENT,
      statusMessage: 'Post updated',
    };
  }
}
