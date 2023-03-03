import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { trim } from 'lodash';
import { Document, HydratedDocument, Model } from 'mongoose';
import { LikeStatuses } from '../../types';
import { PostDto, LikeStatusPostDto, NewestLikesDto } from '../dto';
import { CreatePostDto, UpdatePostDto, PostStaticsType } from '../types';
/*import {
  LikeStatusPostSchema,
  NewestLikesSchema,
} from '../schemas';*/

@Schema()
export class LikeStatusPost {
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

@Schema()
export class NewestLikes {
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
}

export const NewestLikesSchema = SchemaFactory.createForClass(NewestLikes);

@Schema()
export class Post extends Document {
  @Prop({
    type: String,
    required: [true, 'The id field is required'],
  })
  id: string;

  @Prop({
    type: String,
    required: [true, 'The title field is required'],
    trim: true,
    minLength: [3, 'The title field must be at least 3, got {VALUE}'],
    maxLength: [30, 'The title field must be no more than 30, got {VALUE}'],
  })
  title: string;

  @Prop({
    type: String,
    required: [true, 'The shortDescription field is required'],
    trim: true,
    minLength: [
      3,
      'The shortDescription field must be at least 3, got {VALUE}',
    ],
    maxLength: [
      100,
      'The shortDescription field must be no more than 100, got {VALUE}',
    ],
  })
  shortDescription: string;

  @Prop({
    type: String,
    required: [true, 'The content field is required'],
    trim: true,
    minLength: [3, 'The content field must be at least 3, got {VALUE}'],
    maxLength: [
      1000,
      'The content field must be no more than 100, got {VALUE}',
    ],
  })
  content: string;

  @Prop({
    type: String,
    required: [true, 'The blogId field is required'],
    trim: true,
    minLength: [1, 'The blogId field must be at least 1, got {VALUE}'],
    maxLength: [20, 'The blogId field must be no more than 20, got {VALUE}'],
  })
  blogId: string;

  @Prop({
    type: String,
    required: [true, 'The blogName field is required'],
    trim: true,
    minLength: [3, 'The blogName field must be at least 3, got {VALUE}'],
    maxLength: [15, 'The blogName field must be no more than 15, got {VALUE}'],
  })
  blogName: string;

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

  @Prop({ type: [LikeStatusPostSchema], default: [] })
  likes: LikeStatusPostDto[];

  @Prop({ type: [NewestLikesSchema], default: [] })
  newestLikes: NewestLikesDto[];

  setTitle(title: string) {
    if (!trim(title)) throw new Error('Bad title value!');
    this.title = title;
  }

  setShortDescription(shortDescription: string) {
    if (!trim(shortDescription)) throw new Error('Bad shortDescription value!');
    this.shortDescription = shortDescription;
  }

  setContent(content: string) {
    if (!trim(content)) throw new Error('Bad content value!');
    this.content = content;
  }

  setBlogId(blogId: string) {
    if (blogId) throw new Error('Bad blogId value!');
    this.blogId = blogId;
  }

  setBlogName(blogName: string) {
    if (blogName) throw new Error('Bad blogName value!');
    this.blogName = blogName;
  }

  updateAllPost({ title, shortDescription, content }: UpdatePostDto) {
    this.setTitle(title);
    this.setShortDescription(shortDescription);
    this.setContent(content);
  }

  static make(
    { title, shortDescription, content, blogId, blogName }: CreatePostDto,
    PostModel: PostModelType,
  ): PostDocument {
    const postTitle = trim(String(title));
    const postShortDescription = trim(String(shortDescription));
    const postContent = trim(String(content));
    const post = new PostDto(
      postTitle,
      postShortDescription,
      postContent,
      blogId,
      blogName,
    );

    return new PostModel(post);
  }
}

export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & PostStaticsType;
export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {
  setTitle: Post.prototype.setTitle,
  setShortDescription: Post.prototype.setShortDescription,
  setContent: Post.prototype.setContent,
  updateAllPost: Post.prototype.updateAllPost,
};

PostSchema.statics = {
  make: Post.make,
};
