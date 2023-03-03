import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LikeStatuses } from '../../types';

@Schema()
class LikeStatusPost extends Document {
  @Prop({
    type: String,
    required: [true, 'The id field is required'],
  })
  id: string;

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
  likeStatus: string;

  @Prop({
    type: String,
    required: [true, 'The createdAt field is required'],
    trim: true,
  })
  createdAt: string;
}
export const LikeStatusPostSchema =
  SchemaFactory.createForClass(LikeStatusPost);
