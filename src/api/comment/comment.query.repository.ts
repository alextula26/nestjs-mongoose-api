import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  LikeStatuses,
  PageType,
  ResponseViewModelDetail,
  SortDirection,
} from '../../types';

import { LikeStatus, LikeStatusModelType } from '../likeStatus/schemas';
import { Post, PostModelType } from '../post/schemas';

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
    @InjectModel(Post.name) private postModel: PostModelType,
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
  async findCommentsByAllPosts(
    userId: string,
    {
      pageNumber,
      pageSize,
      sortBy = 'createdAt',
      sortDirection = SortDirection.DESC,
    }: QueryCommentModel,
  ): Promise<ResponseViewModelDetail<CommentByPostViewModel>> {
    const number = pageNumber ? Number(pageNumber) : 1;
    const size = pageSize ? Number(pageSize) : 10;

    const filter: any = {
      $and: [{ userId, isBanned: false }],
    };
    const sort: any = {
      [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1,
    };

    const totalCount = await this.CommentModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / size);
    const skip = (number - 1) * size;

    const comments = await this.CommentModel.find()
      .sort(sort)
      .skip(skip)
      .limit(size);
    console.log('userId', userId);
    console.log('comments', comments);
    const commentsViewModel = await Promise.all(
      comments.map(async (comment) => {
        // const foundPost = await this.postModel.findOne({ id: comment.postId });
        // console.log('comment', comment);
        // console.log('foundPost', foundPost);
        // console.log('------------------------------------------');
        return {
          id: comment.id,
          content: comment.content,
          commentatorInfo: {
            userId: comment.userId,
            userLogin: comment.userLogin,
          },
          createdAt: comment.createdAt,
          postInfo: {
            id: 'foundPost.id',
            title: 'foundPost.title',
            blogId: 'foundPost.blogId',
            blogName: 'foundPost.blogName',
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
        // likesCount: foundComment.likesCount,
        // dislikesCount: foundComment.dislikesCount,
        likesCount: likesCount,
        dislikesCount: dislikesCount,
        myStatus: foundLikeStatus
          ? foundLikeStatus.likeStatus
          : LikeStatuses.NONE,
      },
    };
  }
}
