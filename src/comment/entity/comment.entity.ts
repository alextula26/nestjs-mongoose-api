import { getNextStrId } from '../../utils';

export class CommentEntity {
  id: string;
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
  constructor(
    public content: string,
    public postId: string,
    public userId: string,
    public userLogin: string,
  ) {
    this.id = getNextStrId();
    this.likesCount = 0;
    this.dislikesCount = 0;
    this.createdAt = new Date().toISOString();
  }
}
