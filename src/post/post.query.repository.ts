import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  LikeStatuses,
  ResponseViewModelDetail,
  SortDirection,
} from 'src/types';
import { Post, PostDocument, PostModelType } from './schemas';
import { QueryPostModel, PostViewModel } from './types';

@Injectable()
export class PostQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}
  // Получение списка постов
  async findAllPosts(
    {
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy = 'createdAt',
      sortDirection = SortDirection.DESC,
    }: QueryPostModel,
    userId?: string,
  ): Promise<ResponseViewModelDetail<PostViewModel>> {
    const number = pageNumber ? Number(pageNumber) : 1;
    const size = pageSize ? Number(pageSize) : 10;

    const filter: any = {};
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

    return this._getPostsViewModelDetail(
      {
        items: posts,
        totalCount,
        pagesCount,
        page: number,
        pageSize: size,
      },
      userId,
    );
  }
  // Получение списка постов по идентификатору блогера
  async findPostsByBlogId(
    blogId: string,
    {
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy = 'createdAt',
      sortDirection = SortDirection.DESC,
    }: QueryPostModel,
    userId?: string,
  ): Promise<ResponseViewModelDetail<PostViewModel>> {
    const number = pageNumber ? Number(pageNumber) : 1;
    const size = pageSize ? Number(pageSize) : 10;

    const filter: any = { blogId: { $eq: blogId } };
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

    return this._getPostsViewModelDetail(
      {
        items: posts,
        totalCount,
        pagesCount,
        page: number,
        pageSize: size,
      },
      userId,
    );
  }
  // Получение конкретного поста по его идентификатору
  async findPostById(
    postId: string,
    userId?: string,
  ): Promise<PostViewModel | null> {
    const foundPost = await this.PostModel.findOne({ id: postId });

    if (!foundPost) {
      return null;
    }

    return this._getPostViewModel(foundPost, userId);
  }
  _getMyPostStatus(postDocument: PostDocument, userId: string): LikeStatuses {
    if (!userId) {
      return LikeStatuses.NONE;
    }

    const currentLike1 = postDocument.likes.find(
      (item) => item.userId === userId,
    );

    if (!currentLike1) {
      return LikeStatuses.NONE;
    }

    return currentLike1.likeStatus;
  }
  _getPostViewModel(postDocument: PostDocument, userId: string): PostViewModel {
    const myStatus = this._getMyPostStatus(postDocument, userId);

    return {
      id: postDocument.id,
      title: postDocument.title,
      shortDescription: postDocument.shortDescription,
      content: postDocument.content,
      blogId: postDocument.blogId,
      blogName: postDocument.blogName,
      createdAt: postDocument.createdAt,
      extendedLikesInfo: {
        likesCount: postDocument.likesCount,
        dislikesCount: postDocument.dislikesCount,
        myStatus: myStatus,
        newestLikes: postDocument.newestLikes.map((i) => ({
          addedAt: i.createdAt,
          userId: i.userId,
          login: i.userLogin,
        })),
        // likes: dbPost.likes,
      },
    };
  }
  _getPostsViewModelDetail(
    {
      items,
      totalCount,
      pagesCount,
      page,
      pageSize,
    }: ResponseViewModelDetail<PostDocument>,
    userId: string,
  ): ResponseViewModelDetail<PostViewModel> {
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map((item) => {
        const myStatus = this._getMyPostStatus(item, userId);

        return {
          id: item.id,
          title: item.title,
          shortDescription: item.shortDescription,
          content: item.content,
          blogId: item.blogId,
          blogName: item.blogName,
          createdAt: item.createdAt,
          extendedLikesInfo: {
            likesCount: item.likesCount,
            dislikesCount: item.dislikesCount,
            myStatus: myStatus,
            newestLikes: item.newestLikes.map((i) => ({
              addedAt: i.createdAt,
              userId: i.userId,
              login: i.userLogin,
            })),
            // likes: item.likes,
          },
        };
      }),
    };
  }
}
