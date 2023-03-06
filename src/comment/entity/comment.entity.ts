import { getNextStrId } from '../../utils';
import { LikeStatusCommentEntity } from '../entity';

export class CommentEntity {
  id: string;
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
  likes: LikeStatusCommentEntity[];
  constructor(
    public content: string,
    public postId: string,
    public userId: string,
    public userLogin: string,
  ) {
    this.id = getNextStrId();
    this.likesCount = 0;
    this.dislikesCount = 0;
    this.likes = [];
    this.createdAt = new Date().toISOString();
  }
}
