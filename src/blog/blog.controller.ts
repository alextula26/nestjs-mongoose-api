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
import { BlogService } from './blog.service';
import { PostService } from '../post/post.service';
import { BlogQueryRepository } from './blog.query.repository';
import { PostQueryRepository } from '../post/post.query.repository';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { BlogIdDto, CreatePostBaseDto } from '../post/dto/post.dto';
import { QueryBlogModel, BlogViewModel } from './types';
import { PostViewModel, QueryPostModel } from '../post/types';
import { ResponseViewModelDetail } from '../types';

@Controller('api/blogs')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly postService: PostService,
    private readonly blogQueryRepository: BlogQueryRepository,
    private readonly postQueryRepository: PostQueryRepository,
  ) {}
  // Получение списка блогеров
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllBlogs(
    @Query()
    {
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    }: QueryBlogModel,
  ): Promise<ResponseViewModelDetail<BlogViewModel>> {
    const allBlogs = await this.blogQueryRepository.findAllBlogs({
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    });

    return allBlogs;
  }
  // Получение конкретного блогера по его идентификатору
  @Get(':blogId')
  @HttpCode(HttpStatus.OK)
  // Получаем конкретного блогера по его идентификатору
  async findBlogById(@Param('blogId') blogId: string): Promise<BlogViewModel> {
    // Получаем блдогера по идентификатору
    const foundBlog = await this.blogQueryRepository.findBlogById(blogId);
    // Если блог не найден возвращаем ошибку
    if (!foundBlog) {
      throw new HttpException('Blog is not found', HttpStatus.NOT_FOUND);
    }
    // Возвращаем блогера в формате ответа пользователю
    return foundBlog;
  }
  // Создание блогера
  @Post()
  @UseGuards(AuthGuardBasic)
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
  ): Promise<BlogViewModel> {
    // Создаем блогера
    const { blogId, statusCode, statusMessage } =
      await this.blogService.createBlog(createBlogDto);
    // Если при создании блогера возникли ошибки возращаем статус ошибки
    if (statusCode !== HttpStatus.CREATED) {
      throw new HttpException(statusMessage, statusCode);
    }
    // Порлучаем созданный блог в формате ответа пользователю
    const foundBlog = await this.blogQueryRepository.findBlogById(blogId);
    // Возвращаем созданного блогера
    return foundBlog;
  }
  // Обновление блогера
  @Put(':blogId')
  @UseGuards(AuthGuardBasic)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('blogId') blogId: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ): Promise<boolean> {
    // Обновляем блогера
    const { statusCode, statusMessage } = await this.blogService.updateBlog(
      blogId,
      updateBlogDto,
    );
    // Если при обновлении блогера возникли ошибки возращаем статус ошибки
    if (statusCode !== HttpStatus.NO_CONTENT) {
      throw new HttpException(statusMessage, statusCode);
    }

    return true;
  }
  // Удаление блогера
  @Delete(':blogId')
  @UseGuards(AuthGuardBasic)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogById(@Param('blogId') blogId: string): Promise<boolean> {
    // Удаляем блогера
    const isBlogDeleted = await this.blogService.deleteBlogById(blogId);
    // Если при удалении блогера вернулись ошибка возвращаем ее
    if (!isBlogDeleted) {
      throw new HttpException('Blog is not found', HttpStatus.NOT_FOUND);
    }
    // Иначе возвращаем true
    return isBlogDeleted;
  }
  // Получение списка постов по идентификатору блогера
  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  // Получение списка постов конкретного блогера
  async findPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query()
    {
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    }: QueryPostModel,
  ): Promise<ResponseViewModelDetail<PostViewModel>> {
    // Получаем блдогера по идентификатору
    const foundBlog = await this.blogQueryRepository.findBlogById(blogId);
    // Если блог не найден возвращаем ошибку
    if (!foundBlog) {
      throw new HttpException('Blog is not found', HttpStatus.NOT_FOUND);
    }

    const postsByBlogId = await this.postQueryRepository.findPostsByBlogId(
      blogId,
      {
        searchNameTerm,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      },
    );

    return postsByBlogId;
  }
  // Создание поста по идентификатору блогера
  @Post(':blogId/posts')
  @UseGuards(AuthGuardBasic)
  @HttpCode(HttpStatus.CREATED)
  async createPostsByBlogId(
    @Param() { blogId }: BlogIdDto,
    @Body() createPostBaseDto: CreatePostBaseDto,
  ): Promise<PostViewModel> {
    // Создаем пост
    const { postId, statusCode, statusMessage } =
      await this.postService.createPostsByBlogId(blogId, createPostBaseDto);
    // Если при создании поста возникли ошибки возращаем статус ошибки
    if (statusCode !== HttpStatus.CREATED) {
      throw new HttpException(statusMessage, statusCode);
    }
    // Порлучаем созданный пост в формате ответа пользователю
    const foundPost = await this.postQueryRepository.findPostById(postId);
    // Возвращаем созданный пост
    return foundPost;
  }
}
