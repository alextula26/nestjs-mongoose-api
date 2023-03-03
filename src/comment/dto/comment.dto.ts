import { getNextStrId } from '../../utils';
import { LikeStatusCommentDto } from '.';

export class CommentDto {
  id: string;
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
  likes: LikeStatusCommentDto[];
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
