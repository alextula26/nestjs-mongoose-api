import { BlogDocument, BlogModelType } from '../../blog/schemas';
import { MakeBlogModel } from '../types';

export type BlogStaticsType = {
  make: (
    makeBlogModel: MakeBlogModel,
    BlogModel: BlogModelType,
  ) => BlogDocument;
};
