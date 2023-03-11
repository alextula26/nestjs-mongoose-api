import { DeviceDocument, DeviceModelType } from '../../device/schemas';
import { MakeDeviceModel } from '.';

export type DeviceStaticsType = {
  make: (
    makeDeviceModel: MakeDeviceModel,
    DeviceModel: DeviceModelType,
  ) => DeviceDocument;
};
