import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ResponseViewModelDetail } from '../types';
import { PostQueryRepository } from './post.query.repository';
import { PostService } from './post.service';
import {
  CreatePostModel,
  PostViewModel,
  QueryPostModel,
  UpdatePostModel,
} from './types';

@Controller('api/posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly postQueryRepository: PostQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  // Получение списка постов
  async findAllPosts(
    @Query()
    {
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    }: QueryPostModel,
  ): Promise<ResponseViewModelDetail<PostViewModel>> {
    const userId = '';
    const allPosts = await this.postQueryRepository.findAllPosts(
      {
        searchNameTerm,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      },
      userId,
    );

    return allPosts;
  }
  // Получение конкретного поста по его идентификатору
  @Get(':postId')
  @HttpCode(HttpStatus.OK)
  async findPostById(@Param('postId') postId: string): Promise<PostViewModel> {
    const userId = '';
    // Получаем конкретный пост по его идентификатору
    const foundPost = await this.postQueryRepository.findPostById(
      postId,
      userId,
    );
    // Если пост не найден возвращаем ошибку
    if (!foundPost) {
      throw new HttpException('Post is not found', HttpStatus.NOT_FOUND);
    }
    // Возвращаем пост в формате ответа пользователю
    return foundPost;
  }
  // Создание поста
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body()
    { title, shortDescription, content, blogId }: CreatePostModel,
  ): Promise<PostViewModel> {
    // Создаем пост
    const { postId, statusCode, statusMessage } =
      await this.postService.createPost({
        title,
        shortDescription,
        content,
        blogId,
      });
    // Если при создании поста возникли ошибки возращаем статус ошибки
    if (statusCode !== HttpStatus.CREATED) {
      throw new HttpException(statusMessage, statusCode);
    }
    // Порлучаем созданный пост в формате ответа пользователю
    const foundPost = await this.postQueryRepository.findPostById(postId);
    // Возвращаем созданный пост
    return foundPost;
  }
  // Обновление поста
  @Put(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('postId') postId: string,
    @Body()
    { title, shortDescription, content, blogId }: UpdatePostModel,
  ): Promise<boolean> {
    // Обновляем пост
    const { statusCode, statusMessage } = await this.postService.updatePost(
      postId,
      {
        title,
        shortDescription,
        content,
        blogId,
      },
    );
    // Если при обновлении поста возникли ошибки возращаем статус ошибки
    if (statusCode !== HttpStatus.NO_CONTENT) {
      throw new HttpException(statusMessage, statusCode);
    }

    return true;
  }
  // Удаление поста
  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostById(@Param('postId') postId: string): Promise<boolean> {
    // Удаляем пост
    const isPostDeleted = await this.postService.deletePostById(postId);
    // Если при удалении поста вернулись ошибка возвращаем ее
    if (!isPostDeleted) {
      throw new HttpException('Post is not found', HttpStatus.NOT_FOUND);
    }
    // Иначе возвращаем true
    return isPostDeleted;
  }
}
