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
    statusMessage: string;
  }> {
    await validateOrRejectModel(createUserDto, CreateUserDto);

    const { login, password, email } = createUserDto;
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
