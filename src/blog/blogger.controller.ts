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
  ForbiddenException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { AuthGuardBearer } from '../auth.guard';
import {
  CreateBlogCommand,
  DeleteBlogCommand,
  UpdateBlogCommand,
} from './use-cases';

import {
  CreatePostsCommand,
  UpdatePostCommand,
  DeletePostCommand,
} from '../post/use-cases';

import { BlogQueryRepository } from './blog.query.repository';
import { PostQueryRepository } from '../post/post.query.repository';

import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { CreatePostDto, UpdatePostDto } from '../post/dto/post.dto';

import { BlogViewModel, QueryBlogModel } from './types';
import { PostViewModel } from '../post/types';
import { ResponseViewModelDetail } from '../types';

@UseGuards(AuthGuardBearer)
@Controller('api/blogger/blogs')
export class BloggerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly blogQueryRepository: BlogQueryRepository,
    private readonly postQueryRepository: PostQueryRepository,
  ) {}
  // Получение списка блогеров привязанных к пользователю
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllBlogs(
    @Req() request: Request & { userId: string },
    @Query()
    {
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    }: QueryBlogModel,
  ): Promise<ResponseViewModelDetail<BlogViewModel>> {
    const allBlogsByUserId =
      await this.blogQueryRepository.findAllBlogsByUserId(request.userId, {
        searchNameTerm,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      });

    return allBlogsByUserId;
  }
  // Создание блогера
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Req() request: Request & { userId: string },
    @Body() createBlogDto: CreateBlogDto,
  ): Promise<BlogViewModel> {
    // Создаем блогера
    const { blogId, statusCode } = await this.commandBus.execute(
      new CreateBlogCommand(request.userId, createBlogDto),
    );
    // Если при создании блогера возникли ошибки возращаем статус ошибки 400
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Req() request: Request & { userId: string },
    @Param('blogId') blogId: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ): Promise<boolean> {
    // Обновляем блогера
    const { statusCode } = await this.commandBus.execute(
      new UpdateBlogCommand(request.userId, blogId, updateBlogDto),
    );
    // Если при обновлении блогера, он не был найден, возвращаем 404
    if (statusCode === HttpStatus.NOT_FOUND) {
      throw new NotFoundException();
    }
    // Если пользователь не найден, возвращаем ошибку 400
    if (statusCode === HttpStatus.BAD_REQUEST) {
      throw new BadRequestException();
    }
    // Проверяем принадлежит ли обновляемый комментарий пользователю
    if (statusCode === HttpStatus.FORBIDDEN) {
      throw new ForbiddenException();
    }
    // Возвращаем статус 204
    return true;
  }
  // Доделать проверку юзера //
  // Удаление блогера
  @Delete(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogById(
    @Req() request: Request & { userId: string },
    @Param('blogId') blogId: string,
  ): Promise<boolean> {
    // Удаляем блогера
    const { statusCode } = await this.commandBus.execute(
      new DeleteBlogCommand(request.userId, blogId),
    );
    // Если при удалении блогера, он не был найден, возвращаем 404
    if (statusCode === HttpStatus.NOT_FOUND) {
      throw new NotFoundException();
    }
    // Если пользователь не найден, возвращаем ошибку 400
    if (statusCode === HttpStatus.BAD_REQUEST) {
      throw new BadRequestException();
    }
    // Проверяем принадлежит ли обновляемый комментарий пользователю
    if (statusCode === HttpStatus.FORBIDDEN) {
      throw new ForbiddenException();
    }
    // Возвращаем статус 204
    return true;
  }
  // Создание поста
  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostsByBlogId(
    @Req() request: Request & { userId: string },
    @Param('blogId') blogId: string,
    @Body() сreatePostDto: CreatePostDto,
  ): Promise<PostViewModel> {
    // Создаем пост
    const { postId, statusCode } = await this.commandBus.execute(
      new CreatePostsCommand(request.userId, blogId, сreatePostDto),
    );
    // Если блогер не найден, возвращаем ошибку 404
    if (statusCode === HttpStatus.NOT_FOUND) {
      throw new NotFoundException();
    }
    // Если пользователь не найден, возвращаем ошибку 400
    if (statusCode === HttpStatus.BAD_REQUEST) {
      throw new BadRequestException();
    }
    // Проверяем принадлежит ли добавляемый пост пользователю
    if (statusCode === HttpStatus.FORBIDDEN) {
      throw new ForbiddenException();
    }
    // Порлучаем созданный пост в формате ответа пользователю
    const foundPost = await this.postQueryRepository.findPostById(postId, null);
    // Возвращаем созданный пост
    return foundPost;
  }
  // Обновление поста
  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Req() request: Request & { userId: string },
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<void> {
    // Обновляем пост
    const { statusCode } = await this.commandBus.execute(
      new UpdatePostCommand(request.userId, blogId, postId, updatePostDto),
    );
    // Если пост не найден, возвращаем ошибку 404
    if (statusCode === HttpStatus.NOT_FOUND) {
      throw new NotFoundException();
    }
    // Если пользователь не найден, возвращаем ошибку 400
    if (statusCode === HttpStatus.BAD_REQUEST) {
      throw new BadRequestException();
    }
    // Проверяем принадлежит ли блогер обновляемого поста пользователю
    if (statusCode === HttpStatus.FORBIDDEN) {
      throw new ForbiddenException();
    }
  }
  // Удаление поста
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostById(
    @Req() request: Request & { userId: string },
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    // Удаляем пост и связанные с ним комментарии
    const { statusCode } = await this.commandBus.execute(
      new DeletePostCommand(request.userId, blogId, postId),
    );
    // Если пост не найден, возвращаем ошибку 404
    if (statusCode === HttpStatus.NOT_FOUND) {
      throw new NotFoundException();
    }
    // Если пользователь не найден, возвращаем ошибку 400
    if (statusCode === HttpStatus.BAD_REQUEST) {
      throw new BadRequestException();
    }
    // Проверяем принадлежит ли блогер удаляемого поста пользователю
    if (statusCode === HttpStatus.FORBIDDEN) {
      throw new ForbiddenException();
    }
  }
}
