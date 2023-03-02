import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LikeStatuses } from 'src/types';
import { Comment, CommentDocument, CommentModelType } from './schemas';
import { CommentViewModel } from './types';

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}
  async findCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentViewModel | null> {
    const foundComment = await this.CommentModel.findOne({ id: commentId });

    if (!foundComment) {
      return null;
    }

    return this._getCommentViewModel(foundComment, userId);
  }
  _getCommentViewModel(
    commentDocument: CommentDocument,
    userId: string,
  ): CommentViewModel {
    const myStatus = this._getMyStatus(commentDocument, userId);

    return {
      id: commentDocument.id,
      content: commentDocument.content,
      commentatorInfo: {
        userId: commentDocument.userId,
        userLogin: commentDocument.userLogin,
      },
      createdAt: commentDocument.createdAt,
      likesInfo: {
        likesCount: commentDocument.likesCount,
        dislikesCount: commentDocument.dislikesCount,
        myStatus,
        // likes: dbComment.likes,
      },
    };
  }
  _getMyStatus(commentDocument: CommentDocument, userId: string): LikeStatuses {
    if (!userId) {
      return LikeStatuses.NONE;
    }

    const currentLike1 = commentDocument.likes.find(
      (item) => item.userId === userId,
    );

    if (!currentLike1) {
      return LikeStatuses.NONE;
    }

    return currentLike1.likeStatus;
  }
}
