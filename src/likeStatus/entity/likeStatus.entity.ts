import { getNextStrId } from '../../utils';
import { LikeStatuses, PageType } from '../../types';

export class LikeStatusEntity {
  id: string;
  createdAt: string;
  constructor(
    public parentId: string,
    public userId: string,
    public userLogin: string,
    public likeStatus: LikeStatuses,
    public pageType: PageType,
  ) {
    this.id = getNextStrId();
    this.createdAt = new Date().toISOString();
  }
}
