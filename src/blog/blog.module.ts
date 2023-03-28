import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

import { IsBlogExistConstraint } from './custom-validators/customValidateBlog';
import { BlogController } from './blog.controller';
import { BloggerController } from './blogger.controller';
import { BlogService } from './blog.service';
import {
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
} from './use-cases';
import { BlogRepository } from './blog.repository';
import { BlogQueryRepository } from './blog.query.repository';
import { Blog, BlogSchema } from './schemas/blog.schema';

const useCases = [CreateBlogUseCase, UpdateBlogUseCase, DeleteBlogUseCase];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    CqrsModule,
  ],
  controllers: [BlogController, BloggerController],
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
