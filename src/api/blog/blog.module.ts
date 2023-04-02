import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

import { IsBlogExistConstraint } from './custom-validators/customValidateBlog';
import { BlogController } from './blog.controller';
import { BloggerController } from './blogger.controller';
import { SABlogController } from './sa-blog.controller';
import { BlogService } from './blog.service';
import {
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  BindWithUserBlogUseCase,
  BanBlogUseCase,
  BanUserForBlogCommand,
} from './use-cases';
import { BlogRepository } from './blog.repository';
import { BlogQueryRepository } from './blog.query.repository';
import { Blog, BlogSchema } from './schemas/blog.schema';

const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  BindWithUserBlogUseCase,
  BanBlogUseCase,
  BanUserForBlogCommand,
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    CqrsModule,
  ],
  controllers: [BlogController, BloggerController, SABlogController],
  providers: [
    BlogService,
    BlogRepository,
    BlogQueryRepository,
    IsBlogExistConstraint,
    ...useCases,
  ],
  exports: [BlogRepository],
})
export class BlogModule {}
