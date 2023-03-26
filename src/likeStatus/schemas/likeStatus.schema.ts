import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { LikeStatuses, PageType } from '../../types';
import { LikeStatusEntity } from '../entity';
import { MakeLikeStatusModel, LikeStatusStaticsType } from '../types';

@Schema()
export class LikeStatus {
  @Prop({
    type: String,
    required: [true, 'The id field is required'],
  })
  id: string;

  @Prop({
    type: String,
    required: [true, 'The parentId field is required'],
  })
  parentId: string;

  @Prop({
    type: String,
    required: [true, 'The userId field is required'],
  })
  userId: string;

  @Prop({
    type: String,
    required: [true, 'The userLogin field is required'],
    trim: true,
    minLength: [3, 'The userLogin field must be at least 3, got {VALUE}'],
    maxLength: [10, 'The userLogin field must be no more than 10, got {VALUE}'],
    match: /^[a-zA-Z0-9_-]*$/,
  })
  userLogin: string;

  @Prop({
    type: String,
    enum: {
      values: [LikeStatuses.NONE, LikeStatuses.LIKE, LikeStatuses.DISLIKE],
      message: '{VALUE} is not supported',
    },
    default: LikeStatuses.NONE,
  })
  likeStatus: LikeStatuses;

  @Prop({
    type: String,
    required: [true, 'The pageType field is required'],
    enum: {
      values: [PageType.COMMENT, PageType.POST],
      message: '{VALUE} is not supported',
    },
  })
  pageType: PageType;

  @Prop({
    type: String,
    required: [true, 'The createdAt field is required'],
    trim: true,
  })
  createdAt: string;

  // Обновление лайк статуса
  updateLikeStatus(likeStatus: LikeStatuses) {
    // Если аккаунт уже подтвержден, возвращаем ошибку
    if (!this.likeStatus) throw new Error(`LikeStatus incorrect!`);
    // Записываем код для подтверждения email
    this.likeStatus = likeStatus;
  }

  static make(
    { parentId, userId, userLogin, likeStatus, pageType }: MakeLikeStatusModel,
    LikeStatusModel: LikeStatusModelType,
  ): LikeStatusDocument {
    const like = new LikeStatusEntity(
      parentId,
      userId,
      userLogin,
      likeStatus,
      pageType,
    );

    return new LikeStatusModel(like);
  }
}

export type LikeStatusDocument = HydratedDocument<LikeStatus>;
export type LikeStatusModelType = Model<LikeStatusDocument> &
  LikeStatusStaticsType;
export const LikeStatusSchema = SchemaFactory.createForClass(LikeStatus);

LikeStatusSchema.methods = {
  updateLikeStatus: LikeStatus.prototype.updateLikeStatus,
};

LikeStatusSchema.statics = {
  make: LikeStatus.make,
};
