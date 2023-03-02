import { SortDirection } from 'src/types';

export type QueryBlogModel = {
  searchNameTerm: string;
  pageNumber: string;
  pageSize: string;
  sortBy: string;
  sortDirection: SortDirection;
};
