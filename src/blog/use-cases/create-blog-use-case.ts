import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { validateOrRejectModel } from '../../validate';
import { CreateBlogDto } from '../dto/blog.dto';
import { BlogRepository } from '../blog.repository';

export class CreateBlogCommand {
  constructor(public createBlogDto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private readonly blogRepository: BlogRepository) {}
  // Создание блогера
  async execute(command: CreateBlogCommand): Promise<{
    blogId: string;
    statusCode: HttpStatus;
  }> {
    const { createBlogDto } = command;
    // Валидируем DTO
    await validateOrRejectModel(createBlogDto, CreateBlogDto);
    // Получаем поля из DTO
    const { name, description, websiteUrl } = createBlogDto;
    // Создаем документ блогера
    const madeBlog = await this.blogRepository.createBlog({
      name,
      description,
      websiteUrl,
    });
    // Сохраняем блогера в базе
    const createdBlog = await this.blogRepository.save(madeBlog);
    // Ищем созданного блогера в базе
    const foundBlog = await this.blogRepository.findBlogById(createdBlog.id);
    // Если блогера нет, т.е. он не сохранился, возвращаем ошибку 400
    if (!foundBlog) {
      return {
        blogId: null,
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
    // Возвращаем идентификатор созданного блогера и статус 201
    return {
      blogId: createdBlog.id,
      statusCode: HttpStatus.CREATED,
    };
  }
}
