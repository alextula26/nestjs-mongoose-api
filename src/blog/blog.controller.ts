import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Req,
  Query,
  Param,
  Body,
  BadRequestException,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { AuthGuardBasic, AuthGuardBearer } from '../auth.guard';
import { CreatePostsByBlogIdCommand } from '../post/use-cases';
import {
  CreateBlogCommand,
  DeleteBlogCommand,
  UpdateBlogCommand,
} from './use-cases';
import { BlogService } from './blog.service';
import { BlogQueryRepository } from './blog.query.repository';
import { PostQueryRepository } from '../post/post.query.repository';

import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { CreatePostBaseDto } from '../post/dto/post.dto';
import { QueryBlogModel, BlogViewModel } from './types';
import { PostViewModel, QueryPostModel } from '../post/types';
import { ResponseViewModelDetail } from '../types';

@Controller('api/blogs')
export class BlogController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly blogService: BlogService,
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
      throw new NotFoundException();
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
    const { blogId, statusCode } = await this.commandBus.execute(
      new CreateBlogCommand(createBlogDto),
    );
    // Если при создании блогера возникли ошибки возращаем статус ошибки
    if (statusCode === HttpStatus.BAD_REQUEST) {
      throw new BadRequestException();
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
    const { statusCode } = await this.commandBus.execute(
      new UpdateBlogCommand(blogId, updateBlogDto),
    );
    // Если при обновлении блогера, он не был найден, возвращаем 404
    if (statusCode === HttpStatus.NOT_FOUND) {
      throw new NotFoundException();
    }

    return true;
  }
  // Удаление блогера
  @Delete(':blogId')
  @UseGuards(AuthGuardBasic)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogById(@Param('blogId') blogId: string): Promise<boolean> {
    // Удаляем блогера
    const isBlogDeleted = await this.commandBus.execute(
      new DeleteBlogCommand(blogId),
    );
    // Если при удалении блогер не был найден, возвращаем ошибку 404
    if (!isBlogDeleted) {
      throw new NotFoundException();
    }
    // Иначе возвращаем true
    return isBlogDeleted;
  }
  // Получение списка постов по идентификатору блогера
  @Get(':blogId/posts')
  @UseGuards(AuthGuardBearer)
  @HttpCode(HttpStatus.OK)
  // Получение списка постов конкретного блогера
  async findPostsByBlogId(
    @Req() request: Request & { userId: string },
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
    // Если идентификатор блогера не передан возвращаем ошибку 404
    if (!blogId) {
      throw new NotFoundException();
    }
    // Получаем блогера по идентификатору
    const foundBlog = await this.blogService.findBlogById(blogId);
    // Если блогер не найден возвращаем ошибку
    if (!foundBlog) {
      throw new NotFoundException();
    }
    // Получаем пост по идентификатору блогера
    const postsByBlogId = await this.postQueryRepository.findPostsByBlogId(
      blogId,
      request.userId,
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
    @Param('blogId') blogId: string,
    @Body() createPostBaseDto: CreatePostBaseDto,
  ): Promise<PostViewModel> {
    // Создаем пост
    const { postId, statusCode } = await this.commandBus.execute(
      new CreatePostsByBlogIdCommand(blogId, createPostBaseDto),
    );
    // Если блогер не найден, возвращаем ошибку 404
    if (statusCode === HttpStatus.NOT_FOUND) {
      throw new NotFoundException();
    }
    // Порлучаем созданный пост в формате ответа пользователю
    const foundPost = await this.postQueryRepository.findPostById(postId, null);
    // Возвращаем созданный пост
    return foundPost;
  }
}
