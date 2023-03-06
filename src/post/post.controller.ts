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
  UseGuards,
} from '@nestjs/common';
import { AuthGuardBasic } from '../auth.guard';
import { ResponseViewModelDetail } from '../types';
import { PostQueryRepository } from './post.query.repository';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { PostViewModel, QueryPostModel } from './types';

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
  @UseGuards(AuthGuardBasic)
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostViewModel> {
    // Создаем пост
    const { postId, statusCode, statusMessage } =
      await this.postService.createPost(createPostDto);
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
  @UseGuards(AuthGuardBasic)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('postId') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<boolean> {
    // Обновляем пост
    const { statusCode, statusMessage } = await this.postService.updatePost(
      postId,
      updatePostDto,
    );
    // Если при обновлении поста возникли ошибки возращаем статус ошибки
    if (statusCode !== HttpStatus.NO_CONTENT) {
      throw new HttpException(statusMessage, statusCode);
    }

    return true;
  }
  // Удаление поста
  @Delete(':postId')
  @UseGuards(AuthGuardBasic)
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
