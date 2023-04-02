import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isEmpty } from 'lodash';

import { validateOrRejectModel } from '../../../validate';

import { BanRepository } from '../../ban/ban.repository';
import { BlogRepository } from '../../blog/blog.repository';
import { UserRepository } from '../../user/user.repository';

import { BanUserDto } from '../dto/blog.dto';

export class BanUserForBlogCommand {
  constructor(public userId: string, public banUserDto: BanUserDto) {}
}

@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase
  implements ICommandHandler<BanUserForBlogCommand>
{
  constructor(
    private readonly banRepository: BanRepository,
    private readonly blogRepository: BlogRepository,
    private readonly userRepository: UserRepository,
  ) {}
  // Создание блогера
  async execute(command: BanUserForBlogCommand): Promise<{
    statusCode: HttpStatus;
  }> {
    const { userId, banUserDto } = command;
    // Валидируем DTO
    await validateOrRejectModel(banUserDto, BanUserDto);
    // Ищем пользователя
    const foundUser = await this.userRepository.findUserById(userId);
    // Если пользователь не найден, возвращаем ошибку 400
    if (isEmpty(foundUser)) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
      };
    }
    // Получаем поля из DTO
    const { blogId, isBanned, banReason } = banUserDto;
    // Ищем блогера
    const foundBlog = await this.blogRepository.findBlogById(blogId);
    // Если блогер не найден, возвращаем ошибку 404
    if (isEmpty(foundBlog)) {
      return { statusCode: HttpStatus.NOT_FOUND };
    }
    // Ищем забаненного пользователя в базе
    const foundBanUser = await this.banRepository.findBanUserById(
      userId,
      blogId,
    );
    // Если забаненного пользователя в базе нет, создаем его
    if (!foundBanUser) {
      // Создаем документ забаненного пользователя
      const madeBanUser = await this.banRepository.createBanUser({
        blogId: foundBlog.id,
        blogName: foundBlog.name,
        userId: foundUser.id,
        userLogin: foundUser.accountData.login,
        isBanned,
        banReason,
      });
      // Сохраняем забаненного пользователя в базе
      await this.banRepository.save(madeBanUser);
    } else {
      // Обновляем статус бана пользователя
      foundBanUser.banUser(isBanned, banReason);
      await this.banRepository.save(foundBanUser);
    }
    // Возвращаем идентификатор созданного блогера и статус 204
    return {
      statusCode: HttpStatus.NO_CONTENT,
    };
  }
}
