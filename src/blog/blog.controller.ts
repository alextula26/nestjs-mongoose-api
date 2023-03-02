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
import {
  QueryBlogModel,
  CreateBlogModel,
  UpdateBlogModel,
  BlogViewModel,
} from './types';
import { BlogService } from './blog.service';
import { PostService } from '../post/post.service';
import { BlogQueryRepository } from './blog.query.repository';
import { PostQueryRepository } from '../post/post.query.repository';
import { ResponseViewModelDetail } from 'src/types';
import {
  CreatePostForBlogModel,
  PostViewModel,
  QueryPostModel,
} from 'src/post/types';

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
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body()
    { name, description, websiteUrl }: CreateBlogModel,
  ): Promise<BlogViewModel> {
    // Создаем блогера
    const { blogId, statusCode, statusMessage } =
      await this.blogService.createBlog({
        name,
        description,
        websiteUrl,
      });
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('blogId') blogId: string,
    @Body() { name, description, websiteUrl }: UpdateBlogModel,
  ): Promise<boolean> {
    // Обновляем блогера
    const { statusCode, statusMessage } = await this.blogService.updateBlog(
      blogId,
      {
        name,
        description,
        websiteUrl,
      },
    );
    // Если при обновлении блогера возникли ошибки возращаем статус ошибки
    if (statusCode !== HttpStatus.NO_CONTENT) {
      throw new HttpException(statusMessage, statusCode);
    }

    return true;
  }
  // Удаление блогера
  @Delete(':blogId')
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
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Param('blogId') blogId: string,
    @Body()
    { title, shortDescription, content }: CreatePostForBlogModel,
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
}
