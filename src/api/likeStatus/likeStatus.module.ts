import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  UpdateLikeStatusCommentUseCase,
  UpdateLikeStatusPostUseCase,
} from './use-cases';
import { LikeStatusRepository } from './likeStatus.repository';
import { LikeStatus, LikeStatusSchema } from './schemas';

const useCases = [UpdateLikeStatusCommentUseCase, UpdateLikeStatusPostUseCase];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LikeStatus.name, schema: LikeStatusSchema },
    ]),
  ],
  providers: [LikeStatusRepository, ...useCases],
})
export class CommentModule {}
