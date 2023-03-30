import { LikeStatuses, PageType } from '../../../types';

export type MakeLikeStatusModel = {
  parentId: string;
  userId: string;
  userLogin: string;
  likeStatus: LikeStatuses;
  pageType: PageType;
};
