import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { UserDocument } from '../user/schemas';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}
  // Поиск документа конкретного пользователя по его идентификатору
  async findUserById(userId: string): Promise<UserDocument | null> {
    // Ищем пользователя по идентификатору, если пользователь не найден, возвращаем ошибку 401
    const foundUser = await this.userRepository.findUserById(userId);
    // Если пользователь по идентификатору не найден, возвращаем ошибку 401
    if (!foundUser) {
      return null;
    }

    return foundUser;
  }
}
