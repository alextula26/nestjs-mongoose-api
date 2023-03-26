import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  // Удаление пользователя
  async deleteUserById(userId: string): Promise<boolean> {
    const isDeleteUserById = await this.userRepository.deleteUserById(userId);

    return isDeleteUserById;
  }
}
