import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ResponseViewModelDetail, SortDirection } from '../../types';

import { Ban, BanDocument, BanModelType } from './schemas';
import { QueryVannedUserModel, BannedUserViewModel } from './types';

@Injectable()
export class BanQueryRepository {
  constructor(@InjectModel(Ban.name) private BanModel: BanModelType) {}
  async findAllBannedUsersForBlog(
    blogId: string,
    {
      searchLoginTerm,
      pageNumber,
      pageSize,
      sortBy = 'createdAt',
      sortDirection = SortDirection.DESC,
    }: QueryVannedUserModel,
  ): Promise<ResponseViewModelDetail<BannedUserViewModel>> {
    const number = pageNumber ? Number(pageNumber) : 1;
    const size = pageSize ? Number(pageSize) : 10;

    const filter: any = { blogId };
    const sort: any = {
      [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1,
    };

    if (searchLoginTerm) {
      filter.userLogin = { $regex: searchLoginTerm, $options: 'i' };
    }

    const totalCount = await this.BanModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / size);
    const skip = (number - 1) * size;

    const blogs = await this.BanModel.find(filter)
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
  _getBlogsViewModelDetail({
    items,
    totalCount,
    pagesCount,
    page,
    pageSize,
  }: ResponseViewModelDetail<BanDocument>): ResponseViewModelDetail<BannedUserViewModel> {
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map((item) => ({
        id: item.id,
        login: item.userLogin,
        banInfo: {
          isBanned: item.isBanned,
          banDate: item.banDate,
          banReason: item.banReason,
        },
      })),
    };
  }
}
