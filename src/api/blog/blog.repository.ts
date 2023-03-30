import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogDocument, BlogModelType } from './schemas';
import { MakeBlogModel } from './types';

@Injectable()
export class BlogRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}
  // Сохранение блогера в базе
  async save(blog: BlogDocument): Promise<BlogDocument> {
    return await blog.save();
  }
  // Поиск документа конкретного блогера по его идентификатору
  async findBlogById(blogId: string): Promise<BlogDocument | null> {
    const foundBlog = await this.BlogModel.findOne({ id: blogId });

    if (!foundBlog) {
      return null;
    }

    return foundBlog;
  }
  // Создание документа блогера
  async createBlog({
    name,
    description,
    websiteUrl,
    userId,
    userLogin,
  }: MakeBlogModel): Promise<BlogDocument> {
    const madeBlog = this.BlogModel.make(
      { name, description, websiteUrl, userId, userLogin },
      this.BlogModel,
    );

    return madeBlog;
  }
  // Удаление блогера
  async deleteBlogById(blogId: string): Promise<boolean> {
    const { deletedCount } = await this.BlogModel.deleteOne({ id: blogId });

    return deletedCount === 1;
  }
  // Удаление коллекции
  async deleteAll(): Promise<boolean> {
    const { deletedCount } = await this.BlogModel.deleteMany({});

    return deletedCount === 1;
  }
}
