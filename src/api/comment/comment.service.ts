import { Injectable } from '@nestjs/common';

import { CommentRepository } from './comment.repository';
import { CommentDocument } from './schemas';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}
  // Поис комментария
  async findCommentById(commentId: string): Promise<CommentDocument | null> {
    const foundCommentById = await this.commentRepository.findCommentById(
      commentId,
    );

    return foundCommentById;
  }
}
