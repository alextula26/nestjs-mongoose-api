import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isEmpty } from 'lodash';

import { validateOrRejectModel } from '../../validate';
import { UpdatePostDto } from '../dto';
import { PostRepository } from '../post.repository';
import { BlogRepository } from '../../blog/blog.repository';

export class UpdatePostCommand {
  constructor(public postId: string, public updatePostDto: UpdatePostDto) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly blogRepository: BlogRepository,
  ) {}
  // Обновление блогера
  async execute(command: UpdatePostCommand): Promise<{
    statusCode: HttpStatus;
  }> {
    const { postId, updatePostDto } = command;
    // Валидируем DTO
    await validateOrRejectModel(updatePostDto, UpdatePostDto);
    // Получаем поля из DTO
    const { title, shortDescription, content, blogId } = updatePostDto;
    // Ищем блогера, к которому прикреплен пост
    const foundBlog = await this.blogRepository.findBlogById(blogId);
    // Если блогер не найден, возвращаем ошибку
    if (isEmpty(foundBlog)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
    // Ищем пост по идентификатору
    const foundPost = await this.postRepository.findPostById(postId);
    // Если пост не найден возвращаем ошибку
    if (!foundPost) {
      return { statusCode: HttpStatus.NOT_FOUND };
    }
    // Обновляем пост
    foundPost.updateAllPost({
      title,
      shortDescription,
      content,
    });
    // Сохраняем пост в базу
    await this.postRepository.save(foundPost);
    // Возвращаем статус 204
    return { statusCode: HttpStatus.NO_CONTENT };
  }
}
