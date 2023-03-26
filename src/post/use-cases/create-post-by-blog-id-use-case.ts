import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isEmpty } from 'lodash';

import { validateOrRejectModel } from '../../validate';
import { CreatePostBaseDto } from '../dto/post.dto';
import { PostRepository } from '../post.repository';
import { BlogRepository } from '../../blog/blog.repository';

export class CreatePostsByBlogIdCommand {
  constructor(
    public blogId: string,
    public createPostBaseDto: CreatePostBaseDto,
  ) {}
}

@CommandHandler(CreatePostsByBlogIdCommand)
export class CreatePostsByBlogIdUseCase
  implements ICommandHandler<CreatePostsByBlogIdCommand>
{
  constructor(
    private readonly postRepository: PostRepository,
    private readonly blogRepository: BlogRepository,
  ) {}
  // Создание поста по идентификатору блогера
  async execute(command: CreatePostsByBlogIdCommand): Promise<{
    postId: string;
    statusCode: HttpStatus;
  }> {
    const { blogId, createPostBaseDto } = command;
    // Валидируем DTO
    await validateOrRejectModel(createPostBaseDto, CreatePostBaseDto);
    // Получаем поля из DTO
    const { title, shortDescription, content } = createPostBaseDto;
    // Ищем блогера, к которому прикреплен пост
    const foundBlog = await this.blogRepository.findBlogById(blogId);
    // Если блогер не найден, возвращаем ошибку 404
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
    // Возвращаем идентификатор созданного поста и статус CREATED
    return {
      postId: createdPost.id,
      statusCode: HttpStatus.CREATED,
    };
  }
}
