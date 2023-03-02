import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { trim } from 'lodash';
import { HydratedDocument, Model } from 'mongoose';
import { CommentDto, LikeStatusCommentDto } from '../dto';
import {
  CreateCommentDto,
  UpdateCommentDto,
  CommentStaticsType,
} from '../types';
// import { LikeStatusPostSchema, NewestLikesSchema } from '../schemas';

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

  @Prop({
    // type: [LikeStatusCommentSchema],
    type: [
      {
        id: String,
        userId: String,
        userLogin: String,
        likeStatus: String,
        createdAt: String,
      },
    ],
    required: false,
    default: [],
  })
  likes: LikeStatusCommentDto[];

  setContent(content: string) {
    if (!trim(content)) throw new Error('Bad content value!');
    this.content = content;
  }

  updateComment({ content }: UpdateCommentDto) {
    this.setContent(content);
  }

  static make(
    { content, postId, userId, userLogin }: CreateCommentDto,
    CommentModel: CommentModelType,
  ): CommentDocument {
    const commentContent = trim(String(content));
    const comment = new CommentDto(commentContent, postId, userId, userLogin);

    return new CommentModel(comment);
  }
}

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & CommentStaticsType;
export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {
  setContent: Comment.prototype.setContent,
};

CommentSchema.statics = {
  make: Comment.make,
};
