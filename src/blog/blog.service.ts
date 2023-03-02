import { HttpStatus, Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { BlogRepository } from './blog.repository';
import { BlogDocument } from './schemas';
import { CreateBlogModel, UpdateBlogModel } from './types';

@Injectable()
export class BlogService {
  constructor(private readonly blogRepository: BlogRepository) {}
  // Получение конкретного блогера по его идентификатору
  async findBlogById(id: string): Promise<BlogDocument | null> {
    const foundBlogById = await this.blogRepository.findBlogById(id);

    return foundBlogById;
  }
  // Создание блогера
  async createBlog({
    name,
    description,
    websiteUrl,
  }: CreateBlogModel): Promise<{
    blogId: string;
    statusCode: HttpStatus;
    statusMessage: string;
  }> {
    // Создаем документ блогера
    const madeBlog = await this.blogRepository.createBlog({
      name,
      description,
      websiteUrl,
    });
    // Сохраняем блогера в базе
    const createdBlog = await this.blogRepository.save(madeBlog);
    // Ищем созданного блогера в базе
    const foundBlog = await this.blogRepository.findBlogById(createdBlog.id);
    // Если блогера нет, т.е. он не сохранился, возвращаем ошибку
    if (!foundBlog) {
      return {
        blogId: null,
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: `Blog creation error`,
      };
    }
    // Возвращаем идентификатор созданного блогера и статус CREATED
    return {
      blogId: createdBlog.id,
      statusCode: HttpStatus.CREATED,
      statusMessage: 'Blog created',
    };
  }
  // Обновление блогера
  async updateBlog(
    blogId: string,
    { name, description, websiteUrl }: UpdateBlogModel,
  ): Promise<{
    statusCode: HttpStatus;
    statusMessage: string;
  }> {
    // Ищем блогера
    const foundBlog = await this.blogRepository.findBlogById(blogId);
    // Если блогер не найден, возвращаем ошибку
    if (isEmpty(foundBlog)) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        statusMessage: `Blog with id ${blogId} was not found`,
      };
    }
    // Обновляем блогера
    foundBlog.updateAllBlog({ name, description, websiteUrl });
    // Сохраняем в базу
    await this.blogRepository.save(foundBlog);
    // Возвращаем статус NO_CONTENT
    return {
      statusCode: HttpStatus.NO_CONTENT,
      statusMessage: 'Blog updated',
    };
  }
  // Удаление блогера
  async deleteBlogById(blogId: string): Promise<boolean> {
    const isDeleteBlogById = await this.blogRepository.deleteBlogById(blogId);

    return isDeleteBlogById;
  }
}
