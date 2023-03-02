import { UserDocument, UserModelType } from 'src/user/schemas';
import { CreateUserDto } from './CreateUserDto';

export type UserStaticsType = {
  make: (
    createUserDto: CreateUserDto,
    UserModel: UserModelType,
  ) => UserDocument;
};
