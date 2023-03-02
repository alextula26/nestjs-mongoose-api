import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from './schemas';
import { CreateUserDto } from './types';

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
  // Создаем документ пользователя
  async createUser({
    login,
    passwordHash,
    email,
  }: CreateUserDto): Promise<UserDocument> {
    const madeUser = this.UserModel.make(
      { login, passwordHash, email },
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
}
