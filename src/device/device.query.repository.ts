import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument, DeviceModelType } from './schemas';
import { DeviceViewModel } from './types';

@Injectable()
export class DeviceQueryRepository {
  constructor(@InjectModel(Device.name) private DeviceModel: DeviceModelType) {}
  async findAllDevices(userId: string): Promise<DeviceViewModel[]> {
    const devices = await this.DeviceModel.find({ userId });

    return this._getDevicesViewModel(devices);
  }
  _getDevicesViewModel(devices: DeviceDocument[]): DeviceViewModel[] {
    return devices.map((item) => ({
      ip: item.ip,
      title: item.title,
      lastActiveDate: item.lastActiveDate,
      deviceId: item.deviceId,
    }));
  }
}
