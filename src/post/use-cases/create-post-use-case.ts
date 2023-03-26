import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isEmpty } from 'lodash';

import { validateOrRejectModel } from '../../validate';
import { CreatePostDto } from '../dto/post.dto';
import { PostRepository } from '../post.repository';
import { BlogRepository } from '../../blog/blog.repository';

export class CreatePostCommand {
  constructor(public createPostDto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly blogRepository: BlogRepository,
  ) {}
  // Создание блогера
  async execute(command: CreatePostCommand): Promise<{
    postId: string;
    statusCode: HttpStatus;
  }> {
    const { createPostDto } = command;
    // Валидируем DTO
    await validateOrRejectModel(createPostDto, CreatePostDto);
    // Получаем поля из DTO
    const { title, shortDescription, content, blogId } = createPostDto;
    // Ищем блогера, к которому прикреплен пост
    const foundBlog = await this.blogRepository.findBlogById(blogId);
    // Если блогер не найден, возвращаем ошибку
    if (isEmpty(foundBlog)) {
      return {
        postId: null,
        statusCode: HttpStatus.NOT_FOUND,
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
    // Если поста нет, т.е. он не сохранился, возвращаем ошибку 400
    if (!foundPost) {
      return {
        postId: null,
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
    // Возвращаем идентификатор созданного поста и статус CREATED
    return {
      postId: createdPost.id,
      statusCode: HttpStatus.CREATED,
    };
  }
}
