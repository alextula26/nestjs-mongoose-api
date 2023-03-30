import { LikeStatusDocument, LikeStatusModelType } from '../schemas';
import { MakeLikeStatusModel } from '../types';

export type LikeStatusStaticsType = {
  make: (
    makeLikeStatusModel: MakeLikeStatusModel,
    LikeStatusModel: LikeStatusModelType,
  ) => LikeStatusDocument;
};
