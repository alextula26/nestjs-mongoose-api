import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { CommentQueryRepository } from './comment.query.repository';
import { CommentService } from './comment.service';
import { UpdateCommentDto } from './dto';
import { CommentViewModel } from './types';

@Controller('api/comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly commentQueryRepository: CommentQueryRepository,
  ) {}
  // Получение конкретного комментария по его идентификатору
  @Get(':commentId')
  @HttpCode(HttpStatus.OK)
  async findCommentById(
    @Param('commentId') commentId: string,
  ): Promise<CommentViewModel> {
    // Получаем комментарий по идентификатору
    const foundComment = await this.commentQueryRepository.findCommentById(
      commentId,
    );
    // Если комментарий не найден возвращаем ошибку
    if (!foundComment) {
      throw new HttpException('Comment is not found', HttpStatus.NOT_FOUND);
    }
    // Возвращаем комментарий в формате ответа пользователю
    return foundComment;
  }
  // Обновление комментария
  @Put(':commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<boolean> {
    // Обновляем комментарий
    const { statusCode, statusMessage } =
      await this.commentService.updateComment(commentId, updateCommentDto);

    // Если при обновлении комментария возникли ошибки возращаем статус ошибки
    if (statusCode !== HttpStatus.NO_CONTENT) {
      throw new HttpException(statusMessage, statusCode);
    }

    return true;
  }
  // Удаление комментария
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCommentById(
    @Param('commentId') commentId: string,
  ): Promise<boolean> {
    // Удаляем комментарий
    const isCommentDeleted = await this.commentService.deleteCommentById(
      commentId,
    );
    // Если при удалении комментария вернулись ошибка возвращаем ее
    if (!isCommentDeleted) {
      throw new HttpException('Comment is not found', HttpStatus.NOT_FOUND);
    }
    // Иначе возвращаем true
    return isCommentDeleted;
  }
}
