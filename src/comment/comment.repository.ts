import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument, CommentModelType } from './schemas';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}
  // Сохранение комментария в базе
  async save(comment: CommentDocument): Promise<CommentDocument> {
    return await comment.save();
  }
  // Поиск документа конкретного комментария по его идентификатору
  async findCommentById(commentId: string): Promise<CommentDocument | null> {
    const foundComment = await this.CommentModel.findOne({ id: commentId });

    if (!foundComment) {
      return null;
    }

    return foundComment;
  }
  // Удаление комментария
  async deleteCommentById(commentId: string): Promise<boolean> {
    const { deletedCount } = await this.CommentModel.deleteOne({
      id: commentId,
    });

    return deletedCount === 1;
  }
  // Удаление коллекции
  async deleteAll(): Promise<boolean> {
    const { deletedCount } = await this.CommentModel.deleteMany({});

    return deletedCount === 1;
  }
}
