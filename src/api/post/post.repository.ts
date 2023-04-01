import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Post, PostDocument, PostModelType } from './schemas';
import { MakePostModel } from './types';

@Injectable()
export class PostRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}
  // Сохранение поста в базе
  async save(blog: PostDocument): Promise<PostDocument> {
    return await blog.save();
  }
  // Поиск документа конкретного поста по его идентификатору
  async findPostById(postId: string): Promise<PostDocument | null> {
    const foundPost = await this.PostModel.findOne({ id: postId });

    if (!foundPost) {
      return null;
    }

    return foundPost;
  }
  // Создание документа поста
  async createPost({
    title,
    shortDescription,
    content,
    blogId,
    blogName,
    userId,
    userLogin,
  }: MakePostModel): Promise<PostDocument> {
    const madePost = this.PostModel.make(
      { title, shortDescription, content, blogId, blogName, userId, userLogin },
      this.PostModel,
    );

    return madePost;
  }
  // Удаление поста
  async deletePostById(postId: string): Promise<boolean> {
    const { deletedCount } = await this.PostModel.deleteOne({ id: postId });

    return deletedCount === 1;
  }
  // Удаление коллекции
  async deleteAll(): Promise<boolean> {
    const { deletedCount } = await this.PostModel.deleteMany({});

    return deletedCount === 1;
  }
  // Бан постов блогера
  async banPostsByBlogId(blogId: string, isBanned: boolean): Promise<boolean> {
    const { modifiedCount } = await this.PostModel.updateMany(
      { blogId },
      { $set: { isBanned } },
    );

    return modifiedCount > 0;
  }
}
