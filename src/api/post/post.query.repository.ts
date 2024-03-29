import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  LikeStatuses,
  PageType,
  ResponseViewModelDetail,
  SortDirection,
} from '../../types';

import { LikeStatus, LikeStatusModelType } from '../likeStatus/schemas';

import { Post, PostModelType } from './schemas';
import { QueryPostModel, PostViewModel } from './types';

@Injectable()
export class PostQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(LikeStatus.name) private LikeStatusModel: LikeStatusModelType,
  ) {}
  // Получение списка постов
  async findAllPosts(
    userId: string,
    {
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy = 'createdAt',
      sortDirection = SortDirection.DESC,
    }: QueryPostModel,
  ): Promise<ResponseViewModelDetail<PostViewModel>> {
    const number = pageNumber ? Number(pageNumber) : 1;
    const size = pageSize ? Number(pageSize) : 10;

    const filter: any = { isBanned: false };
    const sort: any = {
      [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1,
    };

    if (searchNameTerm) {
      filter.title = { $regex: searchNameTerm, $options: 'i' };
    }

    const totalCount = await this.PostModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / size);
    const skip = (number - 1) * size;

    const posts = await this.PostModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(size);

    const postsViewModel = await Promise.all(
      posts.map(async (post) => {
        const foundLikeStatus = await this.LikeStatusModel.findOne({
          parentId: post.id,
          userId,
          pageType: PageType.POST,
        });

        const newestLikes = await this.LikeStatusModel.find({
          parentId: post.id,
          likeStatus: LikeStatuses.LIKE,
          pageType: PageType.POST,
          isBanned: false,
        })
          .sort({ createdAt: -1 })
          .limit(3);

        const likesCount = await this.LikeStatusModel.countDocuments({
          parentId: post.id,
          pageType: PageType.POST,
          likeStatus: LikeStatuses.LIKE,
          isBanned: false,
        });

        const dislikesCount = await this.LikeStatusModel.countDocuments({
          parentId: post.id,
          pageType: PageType.POST,
          likeStatus: LikeStatuses.DISLIKE,
          isBanned: false,
        });

        return {
          id: post.id,
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo: {
            // likesCount: post.likesCount,
            // dislikesCount: post.dislikesCount,
            likesCount: likesCount,
            dislikesCount: dislikesCount,
            myStatus: foundLikeStatus
              ? foundLikeStatus.likeStatus
              : LikeStatuses.NONE,
            newestLikes: newestLikes.map((i) => ({
              addedAt: i.createdAt,
              userId: i.userId,
              login: i.userLogin,
            })),
          },
        };
      }),
    );

    return {
      pagesCount,
      totalCount,
      page: number,
      pageSize: size,
      items: postsViewModel,
    };
  }
  // Получение списка постов по идентификатору блогера
  async findPostsByBlogId(
    blogId: string,
    userId: string,
    {
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy = 'createdAt',
      sortDirection = SortDirection.DESC,
    }: QueryPostModel,
  ): Promise<ResponseViewModelDetail<PostViewModel>> {
    const number = pageNumber ? Number(pageNumber) : 1;
    const size = pageSize ? Number(pageSize) : 10;

    const filter: any = {
      $and: [{ blogId: { $eq: blogId } }, { isBanned: false }],
    };
    const sort: any = {
      [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1,
    };

    if (searchNameTerm) {
      filter.title = { $regex: searchNameTerm, $options: 'i' };
    }

    const totalCount = await this.PostModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / size);
    const skip = (number - 1) * size;

    const posts = await this.PostModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(size);

    const postsViewModel = await Promise.all(
      posts.map(async (post) => {
        const foundLikeStatus = await this.LikeStatusModel.findOne({
          parentId: post.id,
          userId,
          pageType: PageType.POST,
        });

        const newestLikes = await this.LikeStatusModel.find({
          parentId: post.id,
          likeStatus: LikeStatuses.LIKE,
          pageType: PageType.POST,
          isBanned: false,
        })
          .sort({ createdAt: -1 })
          .limit(3);

        const likesCount = await this.LikeStatusModel.countDocuments({
          parentId: post.id,
          pageType: PageType.POST,
          likeStatus: LikeStatuses.LIKE,
          isBanned: false,
        });

        const dislikesCount = await this.LikeStatusModel.countDocuments({
          parentId: post.id,
          pageType: PageType.POST,
          likeStatus: LikeStatuses.DISLIKE,
          isBanned: false,
        });

        return {
          id: post.id,
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo: {
            // likesCount: post.likesCount,
            // dislikesCount: post.dislikesCount,
            likesCount: likesCount,
            dislikesCount: dislikesCount,
            myStatus: foundLikeStatus
              ? foundLikeStatus.likeStatus
              : LikeStatuses.NONE,
            newestLikes: newestLikes.map((i) => ({
              addedAt: i.createdAt,
              userId: i.userId,
              login: i.userLogin,
            })),
          },
        };
      }),
    );

    return {
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
      items: postsViewModel,
    };
  }
  // Получение конкретного поста по его идентификатору
  async findPostById(
    postId: string,
    userId: string,
  ): Promise<PostViewModel | null> {
    const foundPost = await this.PostModel.findOne({
      id: postId,
      isBanned: false,
    });

    if (!foundPost) {
      return null;
    }

    const foundLikeStatusByUserId = await this.LikeStatusModel.findOne({
      parentId: foundPost.id,
      userId,
      pageType: PageType.POST,
    });

    const newestLikes = await this.LikeStatusModel.find({
      parentId: foundPost.id,
      likeStatus: LikeStatuses.LIKE,
      pageType: PageType.POST,
      isBanned: false,
    })
      .sort({ createdAt: -1 })
      .limit(3);

    const likesCount = await this.LikeStatusModel.countDocuments({
      parentId: foundPost.id,
      pageType: PageType.POST,
      likeStatus: LikeStatuses.LIKE,
      isBanned: false,
    });

    const dislikesCount = await this.LikeStatusModel.countDocuments({
      parentId: foundPost.id,
      pageType: PageType.POST,
      likeStatus: LikeStatuses.DISLIKE,
      isBanned: false,
    });

    return {
      id: foundPost.id,
      title: foundPost.title,
      shortDescription: foundPost.shortDescription,
      content: foundPost.content,
      blogId: foundPost.blogId,
      blogName: foundPost.blogName,
      createdAt: foundPost.createdAt,
      extendedLikesInfo: {
        // likesCount: foundPost.likesCount,
        //  dislikesCount: foundPost.dislikesCount,
        likesCount: likesCount,
        dislikesCount: dislikesCount,
        myStatus: foundLikeStatusByUserId
          ? foundLikeStatusByUserId.likeStatus
          : LikeStatuses.NONE,
        newestLikes: newestLikes.map((i) => ({
          addedAt: i.createdAt,
          userId: i.userId,
          login: i.userLogin,
        })),
      },
    };
  }
}
