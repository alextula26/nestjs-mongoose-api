import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogModule } from '../blog/blog.module';
import { PostController } from './post.controller';
import { PostQueryRepository } from './post.query.repository';
import { PostRepository } from './post.repository';
import { PostService } from './post.service';
import { Post, PostSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    BlogModule,
  ],
  controllers: [PostController],
  providers: [PostService, PostRepository, PostQueryRepository],
  exports: [PostRepository],
})
export class PostModule {}
