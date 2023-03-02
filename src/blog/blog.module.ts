import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogController } from './blog.controller';
import { BlogQueryRepository } from './blog.query.repository';
import { BlogRepository } from './blog.repository';
import { BlogService } from './blog.service';
import { Blog, BlogSchema } from './schemas/blog.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  controllers: [BlogController],
  providers: [BlogService, BlogRepository, BlogQueryRepository],
  exports: [BlogRepository],
})
export class BlogModule {}
