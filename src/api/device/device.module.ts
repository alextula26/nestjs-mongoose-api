import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { DeleteAllDevicesUseCase, DeleteDeviceByIdUseCase } from './use-cases';
import { DeviceRepository } from './device.repository';
import { DeviceQueryRepository } from './device.query.repository';
import { Device, DeviceSchema } from './schemas/device.schema';

const useCases = [DeleteAllDevicesUseCase, DeleteDeviceByIdUseCase];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
  ],
  controllers: [DeviceController],
  providers: [
    DeviceService,
    DeviceRepository,
    DeviceQueryRepository,
    ...useCases,
  ],
})
export class DeviceModule {}
