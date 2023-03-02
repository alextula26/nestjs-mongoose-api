import { HttpStatus, Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { BlogRepository } from 'src/blog/blog.repository';
import { PostRepository } from './post.repository';
import { CreatePostModel, UpdatePostModel } from './types';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly blogRepository: BlogRepository,
  ) {}
  // Создание поста
  async createPost({
    title,
    shortDescription,
    content,
    blogId,
  }: CreatePostModel): Promise<{
    postId: string;
    statusCode: HttpStatus;
    statusMessage: string;
  }> {
    // Ищем блогера, к которому прикреплен пост
    const foundBlog = await this.blogRepository.findBlogById(blogId);
    // Если блогер не найден, возвращаем ошибку
    if (isEmpty(foundBlog)) {
      return {
        postId: null,
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: `Blog with id ${blogId} was not found`,
      };
    }
    // Создаем документ поста
    const madePost = await this.postRepository.createPost({
      title,
      shortDescription,
      content,
      blogId: 'foundBlog.id',
      blogName: 'foundBlog.name',
    });
    // Сохраняем пост в базе
    const createdPost = await this.postRepository.save(madePost);
    // Ищем новый пост в базе
    const foundPost = await this.postRepository.findPostById(createdPost.id);
    // Если поста нет, т.е. он не сохранился, возвращаем ошибку
    if (!foundPost) {
      return {
        postId: null,
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: `Post creation error`,
      };
    }
    // Возвращаем идентификатор созданного поста и статус CREATED
    return {
      postId: createdPost.id,
      statusCode: HttpStatus.CREATED,
      statusMessage: 'Post created',
    };
  }
  // Обновление поста
  async updatePost(
    postId: string,
    { title, shortDescription, content, blogId }: UpdatePostModel,
  ): Promise<{
    statusCode: HttpStatus;
    statusMessage: string;
  }> {
    // Ищем блогера, к которому прикреплен пост
    const foundBlog = await this.blogRepository.findBlogById(blogId);
    // Если блогер не найден, возвращаем ошибку
    if (isEmpty(foundBlog)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: `Blog with id ${blogId} was not found`,
      };
    }
    // Ищем пост по идентификатору
    const foundPost = await this.postRepository.findPostById(postId);
    // Если пост не найден возвращаем ошибку
    if (!foundPost) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        statusMessage: `Post with id ${postId} was not found`,
      };
    }
    // Обновляем пост
    foundPost.updateAllPost({
      title,
      shortDescription,
      content,
      blogId: 'foundPost.id',
      blogName: 'foundPost.title',
    });
    // Сохраняем пост в базу
    await this.postRepository.save(foundPost);
    // Возвращаем статус NO_CONTENT
    return {
      statusCode: HttpStatus.NO_CONTENT,
      statusMessage: 'Post updated',
    };
  }
  // Удаление поста
  async deletePostById(postId: string): Promise<boolean> {
    const isDeletePostById = await this.postRepository.deletePostById(postId);

    return isDeletePostById;
  }
}
