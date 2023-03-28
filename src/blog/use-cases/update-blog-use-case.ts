import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isEmpty } from 'lodash';

import { validateOrRejectModel } from '../../validate';
import { UpdateBlogDto } from '../dto/blog.dto';
import { BlogRepository } from '../blog.repository';
import { UserRepository } from '../../user/user.repository';

export class UpdateBlogCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public updateBlogDto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly userRepository: UserRepository,
  ) {}
  // Обновление блогера
  async execute(command: UpdateBlogCommand): Promise<{
    statusCode: HttpStatus;
  }> {
    const { userId, blogId, updateBlogDto } = command;
    // Валидируем DTO
    await validateOrRejectModel(updateBlogDto, UpdateBlogDto);
    // Получаем поля из DTO
    const { name, description, websiteUrl } = updateBlogDto;
    // Ищем блогера
    const foundBlog = await this.blogRepository.findBlogById(blogId);
    // Если блогер не найден, возвращаем ошибку 404
    if (isEmpty(foundBlog)) {
      return { statusCode: HttpStatus.NOT_FOUND };
    }
    // Ищем пользователя
    const foundUser = await this.userRepository.findUserById(userId);
    // Если пользователь не найден, возвращаем ошибку 400
    if (isEmpty(foundUser)) {
      return { statusCode: HttpStatus.BAD_REQUEST };
    }
    // Проверяем принадлежит ли обновляемый блогер пользователю
    if (
      foundBlog.userId !== foundUser.id ||
      foundBlog.userLogin !== foundUser.accountData.login
    ) {
      return { statusCode: HttpStatus.FORBIDDEN };
    }
    // Обновляем блогера
    foundBlog.updateAllBlog({ name, description, websiteUrl });
    // Сохраняем в базу
    await this.blogRepository.save(foundBlog);
    // Возвращаем статус 204
    return { statusCode: HttpStatus.NO_CONTENT };
  }
}
