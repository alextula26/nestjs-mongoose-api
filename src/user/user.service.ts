import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserModel } from './types';
import { bcryptService } from '../application';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async createUser({ login, email, password }: CreateUserModel): Promise<{
    userId: string;
    statusCode: HttpStatus;
    statusMessage: string;
  }> {
    // Генерируем соль
    const passwordSalt = bcryptService.generateSaltSync(10);
    // Генерируем хэш пароля
    const passwordHash = await bcryptService.generateHash(
      password,
      passwordSalt,
    );
    // Создаем документ пользователя
    const madeUser = await this.userRepository.createUser({
      login,
      passwordHash,
      email,
    });
    // Сохраняем пользователя в базе
    const createdUser = await this.userRepository.save(madeUser);
    // Ищем созданного пользователя в базе
    const foundUser = await this.userRepository.findUserById(createdUser.id);
    // Если пользователя нет, т.е. он не сохранился, возвращаем ошибку
    if (!foundUser) {
      return {
        userId: null,
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: `User creation error`,
      };
    }
    // Возвращаем идентификатор созданного пользователя и статус CREATED
    return {
      userId: createdUser.id,
      statusCode: HttpStatus.CREATED,
      statusMessage: 'User created',
    };
  }
  // Удаление пользователя
  async deleteUserById(userId: string): Promise<boolean> {
    const isDeleteUserById = await this.userRepository.deleteUserById(userId);

    return isDeleteUserById;
  }
}
