import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmpty } from 'lodash';
import { ResponseViewModelDetail, SortDirection } from 'src/types';
import { User, UserDocument, UserModelType } from './schemas';
import { QueryUserModel, UserViewModel } from './types';

@Injectable()
export class UserQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}
  async findAllUsers({
    searchLoginTerm,
    searchEmailTerm,
    pageNumber,
    pageSize,
    sortBy = 'createdAt',
    sortDirection = SortDirection.DESC,
  }: QueryUserModel): Promise<ResponseViewModelDetail<UserViewModel>> {
    const number = pageNumber ? Number(pageNumber) : 1;
    const size = pageSize ? Number(pageSize) : 10;

    const query: any = [];
    const sort: any = {
      [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1,
    };

    if (searchLoginTerm) {
      query.push({
        'accountData.login': { $regex: searchLoginTerm, $options: 'i' },
      });
    }

    if (searchEmailTerm) {
      query.push({
        'accountData.email': { $regex: searchEmailTerm, $options: 'i' },
      });
    }

    const filter = !isEmpty(query) ? { $or: query } : {};

    const totalCount = await this.UserModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / size);
    const skip = (number - 1) * size;

    const users = await this.UserModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(size);

    return this._getUsersViewModelDetail({
      items: users,
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
    });
  }
  async findUserById(userId: string): Promise<UserViewModel | null> {
    const foundUser = await this.UserModel.findOne({ id: userId });

    if (!foundUser) {
      return null;
    }

    return this._getUserViewModel(foundUser);
  }
  _getUserViewModel(userDocument: UserDocument): UserViewModel {
    return {
      id: userDocument.id,
      login: userDocument.accountData.login,
      email: userDocument.accountData.email,
      createdAt: userDocument.accountData.createdAt,
    };
  }
  _getUsersViewModelDetail({
    items,
    totalCount,
    pagesCount,
    page,
    pageSize,
  }: ResponseViewModelDetail<UserDocument>): ResponseViewModelDetail<UserViewModel> {
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map((item) => ({
        id: item.id,
        login: item.accountData.login,
        email: item.accountData.email,
        createdAt: item.accountData.createdAt,
      })),
    };
  }
}
