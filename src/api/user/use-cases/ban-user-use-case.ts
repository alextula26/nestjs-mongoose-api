import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { validateOrRejectModel } from '../../../validate';

import { DeviceRepository } from '../../device/device.repository';
import { CommentRepository } from '../../comment/comment.repository';
import { LikeStatusRepository } from '../../likeStatus/likeStatus.repository';

import { UserRepository } from '../user.repository';
import { BanUserDto } from '../dto/user.dto';

export class BanUserCommand {
  constructor(public userId: string, public banUserDto: BanUserDto) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly deviceRepository: DeviceRepository,
    private readonly commentRepository: CommentRepository,
    private readonly likeStatusRepository: LikeStatusRepository,
  ) {}
  // Бан пользователя
  async execute(command: BanUserCommand): Promise<{
    statusCode: HttpStatus;
  }> {
    const { userId, banUserDto } = command;
    // Валидируем DTO
    await validateOrRejectModel(banUserDto, BanUserDto);
    // Получаем поля из DTO
    const { isBanned, banReason } = banUserDto;
    // Проверяем добавлен ли пользователь с переданным идентификатором
    const foundUserById = await this.userRepository.findUserById(userId);
    // Если пользователь с переданным идентификатором не добавлен в базе, возвращаем ошибку 404
    if (!foundUserById) {
      return { statusCode: HttpStatus.UNAUTHORIZED };
    }
    // Баним пользователя
    foundUserById.banUser(isBanned, banReason);
    // Сохраняем в базу
    await this.userRepository.save(foundUserById);
    // Банним комментарии пользователя
    await this.commentRepository.banCommentsByUserId(userId, isBanned);
    // Банним лайк статусы пользователя
    await this.likeStatusRepository.banUserLikeStatuses(userId, isBanned);
    // Удаляем все устройства пользователя
    await this.deviceRepository.deleteAllUserDevices(userId);
    // Возвращаем статус 204
    return { statusCode: HttpStatus.NO_CONTENT };
  }
}
