import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isEmpty } from 'lodash';

import { validateOrRejectModel } from '../../validate';
import { CreatePostDto } from '../dto/post.dto';
import { PostRepository } from '../post.repository';
import { BlogRepository } from '../../blog/blog.repository';
import { UserRepository } from '../../user/user.repository';

export class CreatePostsCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public сreatePostDto: CreatePostDto,
  ) {}
}

@CommandHandler(CreatePostsCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostsCommand> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly blogRepository: BlogRepository,
    private readonly userRepository: UserRepository,
  ) {}
  // Создание поста по идентификатору блогера
  async execute(command: CreatePostsCommand): Promise<{
    postId: string;
    statusCode: HttpStatus;
  }> {
    const { userId, blogId, сreatePostDto } = command;
    // Валидируем DTO
    await validateOrRejectModel(сreatePostDto, CreatePostDto);
    // Ищем блогера, к которому прикреплен пост
    const foundBlog = await this.blogRepository.findBlogById(blogId);
    // Если блогер не найден, возвращаем ошибку 404
    if (isEmpty(foundBlog)) {
      return {
        postId: null,
        statusCode: HttpStatus.NOT_FOUND,
      };
    }
    // Ищем пользователя
    const foundUser = await this.userRepository.findUserById(userId);
    // Если пользователь не найден, возвращаем ошибку 400
    if (isEmpty(foundUser)) {
      return { postId: null, statusCode: HttpStatus.BAD_REQUEST };
    }
    // Проверяем принадлежит ли обновляемый блогер пользователю
    if (
      foundBlog.userId !== foundUser.id ||
      foundBlog.userLogin !== foundUser.accountData.login
    ) {
      return { postId: null, statusCode: HttpStatus.FORBIDDEN };
    }
    // Получаем поля из DTO
    const { title, shortDescription, content } = сreatePostDto;
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
