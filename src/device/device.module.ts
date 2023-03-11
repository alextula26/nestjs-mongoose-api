import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceController } from './device.controller';
import { DeviceQueryRepository } from './device.query.repository';
import { DeviceRepository } from './device.repository';
import { DeviceService } from './device.service';
import { Device, DeviceSchema } from './schemas/device.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
  ],
  controllers: [DeviceController],
  providers: [DeviceService, DeviceRepository, DeviceQueryRepository],
})
export class DeviceModule {}
