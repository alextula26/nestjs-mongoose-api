import { CommentDocument, CommentModelType } from 'src/comment/schemas';
import { CreateCommentDto } from './CreateCommentDto';

export type CommentStaticsType = {
  make: (
    createCommentDto: CreateCommentDto,
    CommentModel: CommentModelType,
  ) => CommentDocument;
};
