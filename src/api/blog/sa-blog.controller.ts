import {
  Controller,
  Get,
  Put,
  Query,
  Param,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { AuthdBasicGuard } from '../../guards';
import { ResponseViewModelDetail } from '../../types';

import { BindWithUserBlogCommand } from './use-cases';
import { BlogQueryRepository } from './blog.query.repository';
import { BlogViewModel, QueryBlogModel } from './types';

@UseGuards(AuthdBasicGuard)
@Controller('api/sa/blogs')
export class SABlogController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly blogQueryRepository: BlogQueryRepository,
  ) {}
  // Получение списка блогеров
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllBlogsForAdmin(
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
      await this.blogQueryRepository.findAllBlogsForAdmin({
        searchNameTerm,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      });

    return allBlogsByUserId;
  }
  // Привязка пользователя к блогу
  @Put(':blogId/bind-with-user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('blogId') blogId: string,
    @Param('userId') userId: string,
  ): Promise<boolean> {
    // Обновляем блогера
    const { statusCode } = await this.commandBus.execute(
      new BindWithUserBlogCommand(userId, blogId),
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
}
