import { CommentDocument, CommentModelType } from '../../comment/schemas';
import { MakeCommentModel } from '../types';

export type CommentStaticsType = {
  make: (
    makeCommentModel: MakeCommentModel,
    CommentModel: CommentModelType,
  ) => CommentDocument;
};
