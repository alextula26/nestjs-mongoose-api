import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { trim } from 'lodash';
import { HydratedDocument, Model } from 'mongoose';
import { LikeStatuses } from '../../types';
import { CommentEntity, LikeStatusCommentEntity } from '../entity';
import {
  CommentStaticsType,
  MakeCommentModel,
  UpdateCommentModel,
} from '../types';

@Schema()
export class LikeStatusComment {
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

export const LikeStatusCommentSchema =
  SchemaFactory.createForClass(LikeStatusComment);

@Schema()
export class Comment {
  @Prop({
    type: String,
    required: [true, 'The id field is required'],
  })
  id: string;

  @Prop({
    type: String,
    required: [true, 'The content field is required'],
    trim: true,
    min: [20, 'The content field must be at least 20, got {VALUE}'],
    max: [300, 'The content field must be no more than 300, got {VALUE}'],
  })
  content: string;

  @Prop({
    type: String,
    required: [true, 'The postId field is required'],
  })
  postId: string;

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
    required: [true, 'The createdAt field is required'],
    trim: true,
  })
  createdAt: string;

  @Prop({
    type: Number,
    default: 0,
  })
  likesCount: number;

  @Prop({
    type: Number,
    default: 0,
  })
  dislikesCount: number;

  @Prop({ type: [LikeStatusCommentSchema], default: [] })
  likes: LikeStatusCommentEntity[];

  setContent(content: string) {
    if (!trim(content)) {
      throw new Error('The content field is required');
    }
    if (trim(content).length < 20) {
      throw new Error(`The content field must be at least 20, got ${content}`);
    }
    if (trim(content).length > 300) {
      throw new Error(
        `The content field must be no more than 300, got ${content}`,
      );
    }
    this.content = content;
  }

  updateComment({ content }: UpdateCommentModel) {
    this.setContent(content);
  }

  static make(
    { content, postId, userId, userLogin }: MakeCommentModel,
    CommentModel: CommentModelType,
  ): CommentDocument {
    const commentContent = trim(String(content));
    const comment = new CommentEntity(
      commentContent,
      postId,
      userId,
      userLogin,
    );

    return new CommentModel(comment);
  }
}

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & CommentStaticsType;
export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {
  setContent: Comment.prototype.setContent,
  updateComment: Comment.prototype.updateComment,
};

CommentSchema.statics = {
  make: Comment.make,
};
