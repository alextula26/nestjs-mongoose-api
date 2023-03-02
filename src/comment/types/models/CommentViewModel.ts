import { LikeStatusCommentDto } from '../../dto/likeStatusComment.dto';
import { LikeStatuses } from '../../../types';

type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

type LikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatuses;
  likes?: LikeStatusCommentDto[];
};

export type CommentViewModel = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfo;
};
