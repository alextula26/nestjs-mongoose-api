import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  LikeStatuses,
  PageType,
  ResponseViewModelDetail,
  SortDirection,
} from '../../types';

import { LikeStatus, LikeStatusModelType } from '../likeStatus/schemas';

import { Comment, CommentModelType } from './schemas';
import {
  CommentViewModel,
  QueryCommentModel,
  CommentByPostViewModel,
} from './types';

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

    const filter: any = {
      $and: [{ postId: { $eq: postId } }, { isBanned: { $eq: false } }],
    };
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

        const likesCount = await this.LikeStatusModel.countDocuments({
          parentId: comment.id,
          pageType: PageType.COMMENT,
          likeStatus: LikeStatuses.LIKE,
          isBanned: false,
        });

        const dislikesCount = await this.LikeStatusModel.countDocuments({
          parentId: comment.id,
          pageType: PageType.COMMENT,
          likeStatus: LikeStatuses.DISLIKE,
          isBanned: false,
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
            likesCount: likesCount,
            dislikesCount: dislikesCount,
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
  async findCommentsByAllPosts({
    pageNumber,
    pageSize,
    sortBy = 'createdAt',
    sortDirection = SortDirection.DESC,
  }: QueryCommentModel): Promise<
    ResponseViewModelDetail<CommentByPostViewModel>
  > {
    const number = pageNumber ? Number(pageNumber) : 1;
    const size = pageSize ? Number(pageSize) : 10;
    // const totalCount = await this.CommentModel.countDocuments();
    // const pagesCount = Math.ceil(totalCount / size);
    const skip = (number - 1) * size;

    /*const comments = await this.CommentModel.aggregate([
      { $sort: { [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1 } },
      { $skip: skip },
      { $limit: size },
      {
        $lookup: {
          from: 'posts',
          localField: 'postId',
          foreignField: 'id',
          as: 'post',
        },
      },
      { $unwind: '$post' },
      {
        $project: {
          _id: 0,
          id: 1,
          content: 1,
          createdAt: 1,
          commentatorInfo: {
            userId: '$userId',
            userLogin: '$userLogin',
          },
          postInfo: {
            id: '$post.id',
            title: '$post.title',
            blogId: '$post.blogId',
            blogName: '$post.blogName',
          },
        },
      },
    ]);*/

    return {
      pagesCount: 1,
      totalCount: 10,
      page: number,
      pageSize: size,
      items: [
        {
          id: '1',
          content: '1',
          createdAt: '1',
          commentatorInfo: {
            userId: '$userId',
            userLogin: '$userLogin',
          },
          postInfo: {
            id: '$post.id',
            title: '$post.title',
            blogId: '$post.blogId',
            blogName: '$post.blogName',
          },
        },
      ],
    };
  }
  // Поиск комментария по его идентификатору
  async findCommentById(
    commentId: string,
    userId: string,
  ): Promise<CommentViewModel | null> {
    const foundComment = await this.CommentModel.findOne({
      id: commentId,
      isBanned: false,
    });

    if (!foundComment) {
      return null;
    }

    const foundLikeStatus = await this.LikeStatusModel.findOne({
      parentId: foundComment.id,
      userId,
      pageType: PageType.COMMENT,
    });

    const likesCount = await this.LikeStatusModel.countDocuments({
      parentId: foundComment.id,
      pageType: PageType.COMMENT,
      likeStatus: LikeStatuses.LIKE,
      isBanned: false,
    });

    const dislikesCount = await this.LikeStatusModel.countDocuments({
      parentId: foundComment.id,
      pageType: PageType.COMMENT,
      likeStatus: LikeStatuses.DISLIKE,
      isBanned: false,
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
        likesCount: likesCount,
        dislikesCount: dislikesCount,
        myStatus: foundLikeStatus
          ? foundLikeStatus.likeStatus
          : LikeStatuses.NONE,
      },
    };
  }
}
