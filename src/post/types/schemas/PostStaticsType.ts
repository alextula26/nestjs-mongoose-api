import { PostDocument, PostModelType } from '../../../post/schemas';
import { CreatePostDto } from './CreatePostDto';

export type PostStaticsType = {
  make: (
    createPostDto: CreatePostDto,
    PostModel: PostModelType,
  ) => PostDocument;
};
