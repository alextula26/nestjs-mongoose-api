import { LikeStatusDocument, LikeStatusModelType } from '../schemas';
import { MakeLikeStatusModel } from '.';

export type LikeStatusStaticsType = {
  make: (
    makeLikeStatusModel: MakeLikeStatusModel,
    LikeStatusModel: LikeStatusModelType,
  ) => LikeStatusDocument;
};
