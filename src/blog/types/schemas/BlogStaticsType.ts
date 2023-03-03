import { BlogDocument, BlogModelType } from '../../schemas';
import { CreateBlogDto } from './CreateBlogDto';

export type BlogStaticsType = {
  make: (
    createBlogDto: CreateBlogDto,
    BlogModel: BlogModelType,
  ) => BlogDocument;
};
