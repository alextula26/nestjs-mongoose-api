import { BlogDocument, BlogModelType } from 'src/blog/schemas';
import { CreateBlogDto } from './CreateBlogDto';

export type BlogStaticsType = {
  make: (
    createBlogDto: CreateBlogDto,
    BlogModel: BlogModelType,
  ) => BlogDocument;
};
