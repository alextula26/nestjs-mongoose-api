import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { CqrsModule } from '@nestjs/cqrs';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, UserSchema } from './user/schemas';
import { Blog, BlogSchema } from './blog/schemas';
import { Post, PostSchema } from './post/schemas';
import { Comment, CommentSchema } from './comment/schemas';
import { Device, DeviceSchema } from './device/schemas';
import { Session, SessionSchema } from './session/schemas';
import { LikeStatus, LikeStatusSchema } from './likeStatus/schemas';

import { AuthController } from './auth/auth.controller';
import { UserController } from './user/user.controller';
import { BlogController } from './blog/blog.controller';
import { BloggerController } from './blog/blogger.controller';
import { PostController } from './post/post.controller';
import { DeviceController } from './device/device.controller';
import { CommentController } from './comment/comment.controller';
import { TestingController } from './testing/testing.controller';

import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { BlogService } from './blog/blog.service';
import { PostService } from './post/post.service';
import { CommentService } from './comment/comment.service';
import { DeviceService } from './device/device.service';
import { SessionService } from './session/session.service';
import { LikeStatusService } from './likeStatus/likeStatus.service';

import {
  LoginUseCase,
  LogoutUseCase,
  RefreshTokenUseCase,
  RegisterUserUseCase,
  RegistrationConfirmationUseCase,
  RegistrationEmailResendingUseCase,
  PasswordRecoveryUseCase,
  NewPasswordUseCase,
} from './auth/use-cases';
import { CreateUserUseCase } from './user/use-cases';
import {
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
} from './blog/use-cases';
import {
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
} from './post/use-cases';
import {
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
} from './comment/use-cases';
import {
  DeleteAllDevicesUseCase,
  DeleteDeviceByIdUseCase,
} from './device/use-cases';
import {
  CreateSessionUseCase,
  IncreaseAttemptSessionUseCase,
  ResetAttemptSessionUseCase,
} from './session/use-cases';
import {
  UpdateLikeStatusCommentUseCase,
  UpdateLikeStatusPostUseCase,
} from './likeStatus/use-cases';

import { UserRepository } from './user/user.repository';
import { BlogRepository } from './blog/blog.repository';
import { PostRepository } from './post/post.repository';
import { CommentRepository } from './comment/comment.repository';
import { DeviceRepository } from './device/device.repository';
import { SessionRepository } from './session/session.repository';
import { LikeStatusRepository } from './likeStatus/likeStatus.repository';

import { UserQueryRepository } from './user/user.query.repository';
import { BlogQueryRepository } from './blog/blog.query.repository';
import { PostQueryRepository } from './post/post.query.repository';
import { CommentQueryRepository } from './comment/comment.query.repository';
import { DeviceQueryRepository } from './device/device.query.repository';
import { AuthQueryRepository } from './auth/auth.query.repository';

import { EmailAdapter } from './adapters';
import { EmailManager } from './managers';
import { IsBlogExistConstraint } from './blog/custom-validators/customValidateBlog';

const authProviders = [
  AuthService,
  AuthQueryRepository,
  LoginUseCase,
  LogoutUseCase,
  RefreshTokenUseCase,
  RegisterUserUseCase,
  RegistrationConfirmationUseCase,
  RegistrationEmailResendingUseCase,
  PasswordRecoveryUseCase,
  NewPasswordUseCase,
];
const userProviders = [
  UserService,
  UserRepository,
  UserQueryRepository,
  CreateUserUseCase,
];
const blogProviders = [
  IsBlogExistConstraint,
  BlogService,
  BlogRepository,
  BlogQueryRepository,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
];
const postProviders = [
  PostService,
  PostRepository,
  PostQueryRepository,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
];
const commentProviders = [
  CommentService,
  CommentRepository,
  CommentQueryRepository,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
];
const deviceProviders = [
  DeviceService,
  DeviceRepository,
  DeviceQueryRepository,
  DeleteAllDevicesUseCase,
  DeleteDeviceByIdUseCase,
];
const sessionSProviders = [
  SessionService,
  SessionRepository,
  CreateSessionUseCase,
  IncreaseAttemptSessionUseCase,
  ResetAttemptSessionUseCase,
];
const likeStatusSProviders = [
  LikeStatusService,
  LikeStatusRepository,
  UpdateLikeStatusCommentUseCase,
  UpdateLikeStatusPostUseCase,
];
const adapters = [EmailManager, EmailAdapter];

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_ATLAS_URI || 'mongodb://127.0.0.1/bloggers',
    ),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    MongooseModule.forFeature([
      { name: LikeStatus.name, schema: LikeStatusSchema },
    ]),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: 'a.marcuk2023@gmail.com',
          pass: 'suflbzalydymjqnt',
        },
      },
      defaults: {
        from: '"nestjs-video-api" <a.marcuk2023@gmail.com>',
      },
    }),
    CqrsModule,
  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    BlogController,
    BloggerController,
    PostController,
    CommentController,
    DeviceController,
    TestingController,
  ],
  providers: [
    AppService,
    ...authProviders,
    ...userProviders,
    ...blogProviders,
    ...postProviders,
    ...commentProviders,
    ...deviceProviders,
    ...sessionSProviders,
    ...likeStatusSProviders,
    ...adapters,
  ],
  exports: [
    BlogService,
    BlogRepository,
    BlogQueryRepository,

    PostService,
    PostRepository,
    PostQueryRepository,

    CommentService,
    CommentRepository,
    CommentQueryRepository,

    DeviceService,
    DeviceRepository,
    DeviceQueryRepository,

    SessionService,
    SessionRepository,

    LikeStatusService,
    LikeStatusRepository,
  ],
})
export class AppModule {}
