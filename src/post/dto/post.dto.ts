import { getNextStrId } from '../../utils';
import { LikeStatusPostDto, NewestLikesDto } from '../dto';

export class PostDto {
  id: string;
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
  likes: LikeStatusPostDto[];
  newestLikes: NewestLikesDto[];
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
  ) {
    this.id = getNextStrId();
    this.likesCount = 0;
    this.dislikesCount = 0;
    this.likes = [];
    this.newestLikes = [];
    this.createdAt = new Date().toISOString();
  }
}
