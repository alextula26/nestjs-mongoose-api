import { UserDocument, UserModelType } from '../../../user/schemas';
import { CreateUserDto } from './CreateUserDto';

export type UserStaticsType = {
  make: (
    createUserDto: CreateUserDto,
    UserModel: UserModelType,
  ) => UserDocument;
};
