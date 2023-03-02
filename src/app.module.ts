import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
/*import { BlogModule } from './blog/blog.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { CommentModule } from './comment/comment.module';*/

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, UserSchema } from './user/schemas';
import { Blog, BlogSchema } from './blog/schemas';
import { Post, PostSchema } from './post/schemas';
import { Comment, CommentSchema } from './comment/schemas';
import { UserController } from './user/user.controller';
import { BlogController } from './blog/blog.controller';
import { PostController } from './post/post.controller';
import { CommentController } from './comment/comment.controller';
import { TestingController } from './testing/testing.controller';
import { UserService } from './user/user.service';
import { BlogService } from './blog/blog.service';
import { PostService } from './post/post.service';
import { CommentService } from './comment/comment.service';
import { UserRepository } from './user/user.repository';
import { BlogRepository } from './blog/blog.repository';
import { PostRepository } from './post/post.repository';
import { CommentRepository } from './comment/comment.repository';
import { UserQueryRepository } from './user/user.query.repository';
import { BlogQueryRepository } from './blog/blog.query.repository';
import { PostQueryRepository } from './post/post.query.repository';
import { CommentQueryRepository } from './comment/comment.query.repository';

@Module({
  /*imports: [
    MongooseModule.forRoot(
      'mongodb+srv://alextula86:marchuk2008@cluster0.mms9f2q.mongodb.net/bloggers-dev?retryWrites=true&w=majority',
    ),
    BlogModule,
    PostModule,
    UserModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],*/

  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_ATLAS_URI || 'mongodb://127.0.0.1/bloggers',
    ),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],
  controllers: [
    AppController,
    UserController,
    BlogController,
    PostController,
    CommentController,
    TestingController,
  ],
  providers: [
    AppService,
    UserService,
    UserRepository,
    UserQueryRepository,
    BlogService,
    BlogRepository,
    BlogQueryRepository,
    PostService,
    PostRepository,
    PostQueryRepository,
    CommentService,
    CommentRepository,
    CommentQueryRepository,
  ],
  exports: [
    BlogService,
    BlogRepository,
    BlogQueryRepository,
    PostService,
    PostRepository,
    PostQueryRepository,
  ],
})
export class AppModule {}
