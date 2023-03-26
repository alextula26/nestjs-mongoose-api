import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isEmpty } from 'lodash';

import { validateOrRejectModel } from '../../validate';
import { CreateCommentDto } from '../dto/comment.dto';
import { CommentRepository } from '../comment.repository';
import { PostRepository } from '../../post/post.repository';
import { UserRepository } from '../../user/user.repository';

export class CreateCommentCommand {
  constructor(
    public userId: string,
    public postId: string,
    public createCommentDto: CreateCommentDto,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
  ) {}
  // Создание комментария по идентификатору поста
  async execute(command: CreateCommentCommand): Promise<{
    commentId: string;
    statusCode: HttpStatus;
    statusMessage: [{ message: string; field?: string }];
  }> {
    const { userId, postId, createCommentDto } = command;
    // Валидируем DTO
    await validateOrRejectModel(createCommentDto, CreateCommentDto);
    // Ищем пост для которого создаем комментарий
    const foundPost = await this.postRepository.findPostById(postId);
    // Если пост не найден, возвращаем ошибку 404
    if (isEmpty(foundPost)) {
      return {
        commentId: null,
        statusCode: HttpStatus.NOT_FOUND,
        statusMessage: [
          {
            message: `Post with id ${postId} was not found`,
          },
        ],
      };
    }
    // Ищем пользователя
    const foundUser = await this.userRepository.findUserById(userId);
    // Если пользователь не найден, возвращаем ошибку 400
    if (isEmpty(foundUser)) {
      return {
        commentId: null,
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          {
            message: `UserId incorrect`,
          },
        ],
      };
    }
    // Получаем поля из DTO
    const { content } = createCommentDto;
    // Создаем документ комментария
    const madeComment = await this.commentRepository.createComment({
      content,
      postId: foundPost.id,
      userId: foundUser.id,
      userLogin: foundUser.accountData.login,
    });
    // Сохраняем пост в базе
    const createdComment = await this.commentRepository.save(madeComment);
    // Возвращаем идентификатор созданного поста и статус 200
    return {
      commentId: createdComment.id,
      statusCode: HttpStatus.CREATED,
      statusMessage: [
        {
          message: `Comment created`,
        },
      ],
    };
  }
}
