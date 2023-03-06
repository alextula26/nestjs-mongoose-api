import { HttpStatus, Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { BlogRepository } from '../blog/blog.repository';
import { PostRepository } from './post.repository';
import { validateOrRejectModel } from '../validate';
import {
  CreatePostBaseDto,
  CreatePostDto,
  UpdatePostDto,
} from './dto/post.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly blogRepository: BlogRepository,
  ) {}
  // Создание поста
  async createPost(createPostDto: CreatePostDto): Promise<{
    postId: string;
    statusCode: HttpStatus;
    statusMessage: string;
  }> {
    await validateOrRejectModel(createPostDto, CreatePostDto);

    const { title, shortDescription, content, blogId } = createPostDto;
    // Ищем блогера, к которому прикреплен пост
    const foundBlog = await this.blogRepository.findBlogById(blogId);
    // Если блогер не найден, возвращаем ошибку
    if (isEmpty(foundBlog)) {
      return {
        postId: null,
        statusCode: HttpStatus.NOT_FOUND,
        statusMessage: `Blog with id ${blogId} was not found`,
      };
    }
    // Создаем документ поста
    const madePost = await this.postRepository.createPost({
      title,
      shortDescription,
      content,
      blogId: foundBlog.id,
      blogName: foundBlog.name,
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
    updatePostDto: UpdatePostDto,
  ): Promise<{
    statusCode: HttpStatus;
    statusMessage: string;
  }> {
    await validateOrRejectModel(updatePostDto, UpdatePostDto);

    const { title, shortDescription, content, blogId } = updatePostDto;
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
  // Создание поста по идентификатору блогера
  async createPostsByBlogId(
    blogId: string,
    createPostBaseDto: CreatePostBaseDto,
  ): Promise<{
    postId: string;
    statusCode: HttpStatus;
    statusMessage: string;
  }> {
    await validateOrRejectModel(createPostBaseDto, CreatePostBaseDto);

    const { title, shortDescription, content } = createPostBaseDto;
    // Ищем блогера, к которому прикреплен пост
    const foundBlog = await this.blogRepository.findBlogById(blogId);
    // Если блогер не найден, возвращаем ошибку
    if (isEmpty(foundBlog)) {
      return {
        postId: null,
        statusCode: HttpStatus.NOT_FOUND,
        statusMessage: `Blog with id ${blogId} was not found`,
      };
    }
    // Создаем документ поста
    const madePost = await this.postRepository.createPost({
      title,
      shortDescription,
      content,
      blogId: foundBlog.id,
      blogName: foundBlog.name,
    });
    console.log('madePost', madePost);
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
}
