import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isEmpty } from 'lodash';

import { validateOrRejectModel } from '../../validate';
import { UpdateBlogDto } from '../dto/blog.dto';
import { BlogRepository } from '../blog.repository';

export class UpdateBlogCommand {
  constructor(public blogId: string, public updateBlogDto: UpdateBlogDto) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogRepository: BlogRepository) {}
  // Обновление блогера
  async execute(command: UpdateBlogCommand): Promise<{
    statusCode: HttpStatus;
  }> {
    const { blogId, updateBlogDto } = command;
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
    // Обновляем блогера
    foundBlog.updateAllBlog({ name, description, websiteUrl });
    // Сохраняем в базу
    await this.blogRepository.save(foundBlog);
    // Возвращаем статус 204
    return { statusCode: HttpStatus.NO_CONTENT };
  }
}
