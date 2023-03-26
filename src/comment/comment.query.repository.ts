import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  LikeStatuses,
  PageType,
  ResponseViewModelDetail,
  SortDirection,
} from '../types';
import { CommentViewModel, QueryCommentModel } from './types';

import { Comment, CommentModelType } from './schemas';
import { LikeStatus, LikeStatusModelType } from '../likeStatus/schemas';

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(LikeStatus.name) private LikeStatusModel: LikeStatusModelType,
  ) {}
  // Поиск комментариев по идентификатору поста
  async findCommentsByPostId(
    postId: string,
    userId: string,
    {
      pageNumber,
      pageSize,
      sortBy = 'createdAt',
      sortDirection = SortDirection.DESC,
    }: QueryCommentModel,
  ): Promise<ResponseViewModelDetail<CommentViewModel>> {
    const number = pageNumber ? Number(pageNumber) : 1;
    const size = pageSize ? Number(pageSize) : 10;

    const filter: any = { postId: { $eq: postId } };
    const sort: any = {
      [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1,
    };

    const totalCount = await this.CommentModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / size);
    const skip = (number - 1) * size;

    const comments = await this.CommentModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(size);

    const commentsViewModel = await Promise.all(
      comments.map(async (comment) => {
        const foundLikeStatus = await this.LikeStatusModel.findOne({
          parentId: comment.id,
          userId,
          pageType: PageType.COMMENT,
        });

        return {
          id: comment.id,
          content: comment.content,
          commentatorInfo: {
            userId: comment.userId,
            userLogin: comment.userLogin,
          },
          createdAt: comment.createdAt,
          likesInfo: {
            likesCount: comment.likesCount,
            dislikesCount: comment.dislikesCount,
            myStatus: foundLikeStatus
              ? foundLikeStatus.likeStatus
              : LikeStatuses.NONE,
          },
        };
      }),
    );

    return {
      pagesCount,
      totalCount,
      page: number,
      pageSize: size,
      items: commentsViewModel,
    };
  }
  // Поиск комментария по его идентификатору
  async findCommentById(
    commentId: string,
    userId: string,
  ): Promise<CommentViewModel | null> {
    const foundComment = await this.CommentModel.findOne({ id: commentId });

    if (!foundComment) {
      return null;
    }

    const foundLikeStatus = await this.LikeStatusModel.findOne({
      parentId: foundComment.id,
      userId,
      pageType: PageType.COMMENT,
    });

    return {
      id: foundComment.id,
      content: foundComment.content,
      commentatorInfo: {
        userId: foundComment.userId,
        userLogin: foundComment.userLogin,
      },
      createdAt: foundComment.createdAt,
      likesInfo: {
        likesCount: foundComment.likesCount,
        dislikesCount: foundComment.dislikesCount,
        myStatus: foundLikeStatus
          ? foundLikeStatus.likeStatus
          : LikeStatuses.NONE,
      },
    };
  }
}
