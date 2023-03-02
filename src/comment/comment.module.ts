import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentController } from './comment.controller';
import { CommentQueryRepository } from './comment.query.repository';
import { CommentRepository } from './comment.repository';
import { CommentService } from './comment.service';
import {
  Comment,
  CommentSchema,
  // LikeStatusComment,
  // LikeStatusCommentSchema,
} from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      // { name: LikeStatusComment.name, schema: LikeStatusCommentSchema },
    ]),
  ],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository, CommentQueryRepository],
})
export class CommentModule {}
