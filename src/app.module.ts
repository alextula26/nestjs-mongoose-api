import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { CqrsModule } from '@nestjs/cqrs';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, UserSchema } from './api/user/schemas';
import { Blog, BlogSchema } from './api/blog/schemas';
import { Post, PostSchema } from './api/post/schemas';
import { Comment, CommentSchema } from './api/comment/schemas';
import { Device, DeviceSchema } from './api/device/schemas';
import { Session, SessionSchema } from './api/session/schemas';
import { LikeStatus, LikeStatusSchema } from './api/likeStatus/schemas';

import { AuthController } from './api/auth/auth.controller';
import { UserController } from './api/user/user.controller';
import { BlogController } from './api/blog/blog.controller';
import { BloggerController } from './api/blog/blogger.controller';
import { SABlogController } from './api/blog/sa-blog.controller';
import { PostController } from './api/post/post.controller';
import { DeviceController } from './api/device/device.controller';
import { CommentController } from './api/comment/comment.controller';
import { TestingController } from './api/testing/testing.controller';

import { AuthService } from './api/auth/auth.service';
import { UserService } from './api/user/user.service';
import { BlogService } from './api/blog/blog.service';
import { PostService } from './api/post/post.service';
import { CommentService } from './api/comment/comment.service';
import { DeviceService } from './api/device/device.service';
import { SessionService } from './api/session/session.service';
import { LikeStatusService } from './api/likeStatus/likeStatus.service';

import {
  LoginUseCase,
  LogoutUseCase,
  RefreshTokenUseCase,
  RegisterUserUseCase,
  RegistrationConfirmationUseCase,
  RegistrationEmailResendingUseCase,
  PasswordRecoveryUseCase,
  NewPasswordUseCase,
} from './api/auth/use-cases';
import { CreateUserUseCase, BanUserUseCase } from './api/user/use-cases';
import {
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  BindWithUserBlogUseCase,
} from './api/blog/use-cases';
import {
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
} from './api/post/use-cases';
import {
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
} from './api/comment/use-cases';
import {
  DeleteAllDevicesUseCase,
  DeleteDeviceByIdUseCase,
} from './api/device/use-cases';
import {
  CreateSessionUseCase,
  IncreaseAttemptSessionUseCase,
  ResetAttemptSessionUseCase,
} from './api/session/use-cases';
import {
  UpdateLikeStatusCommentUseCase,
  UpdateLikeStatusPostUseCase,
} from './api/likeStatus/use-cases';

import { UserRepository } from './api/user/user.repository';
import { BlogRepository } from './api/blog/blog.repository';
import { PostRepository } from './api/post/post.repository';
import { CommentRepository } from './api/comment/comment.repository';
import { DeviceRepository } from './api/device/device.repository';
import { SessionRepository } from './api/session/session.repository';
import { LikeStatusRepository } from './api/likeStatus/likeStatus.repository';

import { UserQueryRepository } from './api/user/user.query.repository';
import { BlogQueryRepository } from './api/blog/blog.query.repository';
import { PostQueryRepository } from './api/post/post.query.repository';
import { CommentQueryRepository } from './api/comment/comment.query.repository';
import { DeviceQueryRepository } from './api/device/device.query.repository';
import { AuthQueryRepository } from './api/auth/auth.query.repository';

import { EmailAdapter } from './adapters';
import { EmailManager } from './managers';
import { IsBlogExistConstraint } from './api/blog/custom-validators/customValidateBlog';

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
  BanUserUseCase,
];
const blogProviders = [
  IsBlogExistConstraint,
  BlogService,
  BlogRepository,
  BlogQueryRepository,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  BindWithUserBlogUseCase,
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
    SABlogController,
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
