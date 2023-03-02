import { HttpStatus, Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { CommentRepository } from './comment.repository';
import { CommentDocument } from './schemas';
import { UpdateCommentModel } from './types';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}
  // Создать комментарий
  async findCommentById(commentId: string): Promise<CommentDocument | null> {
    const foundCommentById = await this.commentRepository.findCommentById(
      commentId,
    );

    return foundCommentById;
  }
  // Обновить комментарий
  async updateComment(
    commentId: string,
    { content }: UpdateCommentModel,
  ): Promise<{
    statusCode: HttpStatus;
    statusMessage: string;
  }> {
    // Ищем комментарий
    const foundComment = await this.commentRepository.findCommentById(
      commentId,
    );
    // Если комментарий не найден, возвращаем ошибку
    if (isEmpty(foundComment)) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        statusMessage: `Comment with id ${commentId} was not found`,
      };
    }
    // Проверяем принадлежит ли обновляемый комментарий пользователю
    /*
    if (foundComment.userId !== req.user!.userId || foundComment.userLogin !== req.user!.login) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        statusMessage: `FORBIDDEN`,
      };
    }*/
    // Обновляем блогера
    foundComment.updateComment({ content });
    // Сохраняем в базу
    await this.commentRepository.save(foundComment);
    // Возвращаем статус NO_CONTENT
    return {
      statusCode: HttpStatus.NO_CONTENT,
      statusMessage: 'Comment updated',
    };
  }
  // Удаление комментария
  async deleteCommentById(commentId: string): Promise<boolean> {
    const isDeleteCommentById = await this.commentRepository.deleteCommentById(
      commentId,
    );

    return isDeleteCommentById;
  }
}
