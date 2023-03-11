import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../user/schemas';
import { UserAuthViewModel } from './types';

@Injectable()
export class AuthQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}
  async findAuthUserById(userId: string): Promise<UserAuthViewModel | null> {
    const foundUser = await this.UserModel.findOne({ id: userId });

    if (!foundUser) {
      return null;
    }

    return this._getUserAuthViewModel(foundUser);
  }
  _getUserAuthViewModel(userDocument: UserDocument): UserAuthViewModel {
    return {
      userId: userDocument.id,
      login: userDocument.accountData.login,
      email: userDocument.accountData.email,
    };
  }
}
