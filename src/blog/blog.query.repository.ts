import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ResponseViewModelDetail, SortDirection } from '../types';
import { Blog, BlogDocument, BlogModelType } from './schemas';
import { QueryBlogModel, BlogViewModel } from './types';

@Injectable()
export class BlogQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}
  async findAllBlogs({
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy = 'createdAt',
    sortDirection = SortDirection.DESC,
  }: QueryBlogModel): Promise<ResponseViewModelDetail<BlogViewModel>> {
    const number = pageNumber ? Number(pageNumber) : 1;
    const size = pageSize ? Number(pageSize) : 10;

    const filter: any = {};
    const sort: any = {
      [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1,
    };

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }

    const totalCount = await this.BlogModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / size);
    const skip = (number - 1) * size;

    const blogs = await this.BlogModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(size);

    return this._getBlogsViewModelDetail({
      items: blogs,
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
    });
  }
  async findAllBlogsByUserId(
    userId: string,
    {
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy = 'createdAt',
      sortDirection = SortDirection.DESC,
    }: QueryBlogModel,
  ): Promise<ResponseViewModelDetail<BlogViewModel>> {
    const number = pageNumber ? Number(pageNumber) : 1;
    const size = pageSize ? Number(pageSize) : 10;

    const filter: any = { userId: { $eq: userId } };
    const sort: any = {
      [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1,
    };

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }

    const totalCount = await this.BlogModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / size);
    const skip = (number - 1) * size;

    const blogsByUserId = await this.BlogModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(size);

    return this._getBlogsViewModelDetail({
      items: blogsByUserId,
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
    });
  }
  async findBlogById(blogId: string): Promise<BlogViewModel | null> {
    const foundBlog = await this.BlogModel.findOne({ id: blogId });

    if (!foundBlog) {
      return null;
    }

    return this._getBlogViewModel(foundBlog);
  }
  _getBlogViewModel(blogDocument: BlogDocument): BlogViewModel {
    return {
      id: blogDocument.id,
      name: blogDocument.name,
      description: blogDocument.description,
      websiteUrl: blogDocument.websiteUrl,
      isMembership: blogDocument.isMembership,
      createdAt: blogDocument.createdAt,
    };
  }
  _getBlogsViewModelDetail({
    items,
    totalCount,
    pagesCount,
    page,
    pageSize,
  }: ResponseViewModelDetail<BlogDocument>): ResponseViewModelDetail<BlogViewModel> {
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        websiteUrl: item.websiteUrl,
        isMembership: item.isMembership,
        createdAt: item.createdAt,
      })),
    };
  }
}
