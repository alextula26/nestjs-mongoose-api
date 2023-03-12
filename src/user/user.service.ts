import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { validateOrRejectModel } from '../validate';
import { CreateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async createUser(createUserDto: CreateUserDto): Promise<{
    userId: string;
    statusCode: HttpStatus;
    statusMessage: [{ message: string; field?: string }];
  }> {
    await validateOrRejectModel(createUserDto, CreateUserDto);

    const { login, password, email } = createUserDto;
    // Проверяем добавлен ли пользователь с переданным логином
    const foundUserByLogin = await this.userRepository.findByLoginOrEmail(
      login,
    );
    // Если пользователь с переданным логином уже добавлен в базе, возвращаем ошибку 400
    if (foundUserByLogin) {
      return {
        userId: null,
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          {
            message: `The user is already registered in the system`,
            field: 'login',
          },
        ],
      };
    }
    // Проверяем добавлен ли пользователь с переданным email
    const foundUserByEmail = await this.userRepository.findByLoginOrEmail(
      email,
    );
    // Если пользователь с переданным email уже добавлен в базе, возвращаем ошибку 400
    if (foundUserByEmail) {
      return {
        userId: null,
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: [
          {
            message: `The user is already registered in the system`,
            field: 'email',
          },
        ],
      };
    }
    // Создаем документ пользователя
    const madeUser = await this.userRepository.createUser({
      login,
      password,
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
        statusMessage: [{ message: 'User creation error' }],
      };
    }
    // Возвращаем идентификатор созданного пользователя и статус CREATED
    return {
      userId: createdUser.id,
      statusCode: HttpStatus.CREATED,
      statusMessage: [{ message: 'User created' }],
    };
  }
  // Удаление пользователя
  async deleteUserById(userId: string): Promise<boolean> {
    const isDeleteUserById = await this.userRepository.deleteUserById(userId);

    return isDeleteUserById;
  }
}
