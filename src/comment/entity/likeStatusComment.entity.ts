import { getNextStrId } from '../../utils';
import { LikeStatuses } from '../../types';

export class LikeStatusCommentEntity {
  id: string;
  createdAt: string;
  constructor(
    public userId: string,
    public userLogin: string,
    public likeStatus: LikeStatuses,
  ) {
    this.id = getNextStrId();
    this.createdAt = new Date().toISOString();
  }
}
