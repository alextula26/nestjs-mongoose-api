import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

import { CommentController } from './comment.controller';
import { CommentQueryRepository } from './comment.query.repository';
import { CommentRepository } from './comment.repository';
import { CommentService } from './comment.service';
import {
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
} from './use-cases';
import { Comment, CommentSchema } from './schemas';

const useCases = [
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    CqrsModule,
  ],
  controllers: [CommentController],
  providers: [
    CommentService,
    CommentRepository,
    CommentQueryRepository,
    ...useCases,
  ],
  exports: [CommentRepository],
})
export class CommentModule {}
