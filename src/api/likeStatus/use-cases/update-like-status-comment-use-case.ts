import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isEmpty } from 'lodash';

import { validateOrRejectModel } from '../../../validate';
// import { LikeStatuses, PageType } from '../../../types';
import { PageType } from '../../../types';

import { UserRepository } from '../../user/user.repository';
import { CommentRepository } from '../../comment/comment.repository';

import { LikeStatusRepository } from '../likeStatus.repository';
import { AddLikeStatusDTO } from '../dto/likeStatus.dto';

export class UpdateLikeStatusCommentCommand {
  constructor(
    public userId: string,
    public commentId: string,
    public addLikeStatusDTO: AddLikeStatusDTO,
  ) {}
}

@CommandHandler(UpdateLikeStatusCommentCommand)
export class UpdateLikeStatusCommentUseCase
  implements ICommandHandler<UpdateLikeStatusCommentCommand>
{
  constructor(
    private readonly likeStatusRepository: LikeStatusRepository,
    private readonly commentRepository: CommentRepository,
    private readonly userRepository: UserRepository,
  ) {}
  // Обновление лайк статуса коментария
  async execute(command: UpdateLikeStatusCommentCommand): Promise<{
    statusCode: HttpStatus;
    statusMessage: [{ message: string; field?: string }];
  }> {
    const { userId, commentId, addLikeStatusDTO } = command;
    // Валидируем DTO
    await validateOrRejectModel(addLikeStatusDTO, AddLikeStatusDTO);
    // Ищем комментарий
    const foundComment = await this.commentRepository.findCommentById(
      commentId,
    );
    // Если комментарий не найден, возвращаем ошибку 404
    if (isEmpty(foundComment)) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        statusMessage: [
          {
            message: `Comment with id ${commentId} was not found`,
            field: 'commentId',
          },
        ],
      };
    }
    // Ищем пользователя
    const foundUser = await this.userRepository.findUserById(userId);
    // Если пользователь не найден, возвращаем ошибку 400
    if (isEmpty(foundUser)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          {
            message: `User with id ${userId} was not found`,
            field: 'userId',
          },
        ],
      };
    }
    // Получаем лайк статус из DTO
    const { likeStatus } = addLikeStatusDTO;
    // Находим лайк статус коментария пользователя
    const foundLikeStatusOfUserComment =
      await this.likeStatusRepository.findLikeStatusOfUser(
        userId,
        commentId,
        PageType.COMMENT,
      );
    // Если пользователь не лайкал комментарий, то создаем инстанс лайк статуса и добавляем его для комментария
    if (!foundLikeStatusOfUserComment) {
      const madeLikeStatus = await this.likeStatusRepository.createLikeStatus({
        parentId: commentId,
        userId: foundUser.id,
        userLogin: foundUser.accountData.login,
        likeStatus,
        pageType: PageType.COMMENT,
      });
      // Сохраняем созданный лайкстатус в базе
      await this.likeStatusRepository.save(madeLikeStatus);
      // Находим количество лайков комментария
      /*const likesCount = await this.likeStatusRepository.getLikeStatusCount(
        commentId,
        PageType.COMMENT,
        LikeStatuses.LIKE,
      );
      // Находим количество дизлайков комментария
      const dislikesCount = await this.likeStatusRepository.getLikeStatusCount(
        commentId,
        PageType.COMMENT,
        LikeStatuses.DISLIKE,
      );*/
      // Обновляем количесво лайков и дизлайков комментария
      // foundComment.updateLikeStatusesCount({ likesCount, dislikesCount });
      // Сохраняем комментарий в базе
      // await this.commentRepository.save(foundComment);
      // Возвращаем статус 204
      return {
        statusCode: HttpStatus.NO_CONTENT,
        statusMessage: [
          {
            message: `Like status update`,
          },
        ],
      };
    }
    // Если лайк статус пользователя равен переданому лайк статусу не производим обновление лайк статуса
    if (foundLikeStatusOfUserComment.likeStatus === likeStatus) {
      return {
        statusCode: HttpStatus.NO_CONTENT,
        statusMessage: [
          {
            message: `Like status update`,
          },
        ],
      };
    }
    // Обновляем лайк статус
    foundLikeStatusOfUserComment.updateLikeStatus(likeStatus);
    // Сохраняем лайкстатус в базе
    await this.likeStatusRepository.save(foundLikeStatusOfUserComment);
    // Находим количество лайков комментария
    /*const likesCount = await this.likeStatusRepository.getLikeStatusCount(
      commentId,
      PageType.COMMENT,
      LikeStatuses.LIKE,
    );*/
    // Находим количество дизлайков комментария
    /* const dislikesCount = await this.likeStatusRepository.getLikeStatusCount(
      commentId,
      PageType.COMMENT,
      LikeStatuses.DISLIKE,
    );*/
    // Обновляем количесво лайков и дизлайков комментария
    // foundComment.updateLikeStatusesCount({ likesCount, dislikesCount });
    // Сохраняем комментарий в базе
    // await this.commentRepository.save(foundComment);
    // Возвращаем статус 204
    return {
      statusCode: HttpStatus.NO_CONTENT,
      statusMessage: [
        {
          message: `Like status update`,
        },
      ],
    };
  }
}
