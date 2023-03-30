import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument, UserModelType } from './schemas';
import { MakeUserModel } from './types';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}
  // Сохранение пользователя в базе
  async save(user: UserDocument): Promise<UserDocument> {
    return await user.save();
  }
  // Поиск документа конкретного пользователя по его идентификатору
  async findUserById(userId: string): Promise<UserDocument | null> {
    const foundUser = await this.UserModel.findOne({ id: userId });

    if (!foundUser) {
      return null;
    }

    return foundUser;
  }
  async findByConfirmationCode(code: string) {
    const foundUser = await this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });

    if (!foundUser) {
      return null;
    }

    return foundUser;
  }
  async findByRecoveryCode(recoveryCode: string) {
    const foundUser = await this.UserModel.findOne({
      'passwordRecovery.recoveryCode': recoveryCode,
    });

    if (!foundUser) {
      return null;
    }

    return foundUser;
  }
  // Создаем документ пользователя
  async createUser({
    login,
    password,
    email,
  }: MakeUserModel): Promise<UserDocument> {
    const madeUser = this.UserModel.make(
      { login, password, email },
      this.UserModel,
    );

    return madeUser;
  }
  // Удаление пользователя
  async deleteUserById(userId: string): Promise<boolean> {
    const { deletedCount } = await this.UserModel.deleteOne({ id: userId });

    return deletedCount === 1;
  }
  // Удаление коллекции
  async deleteAll(): Promise<boolean> {
    const { deletedCount } = await this.UserModel.deleteMany({});

    return deletedCount === 1;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    const foundUser = await this.UserModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });

    if (!foundUser) {
      return null;
    }

    return foundUser;
  }
}
