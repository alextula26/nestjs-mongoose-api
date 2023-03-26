import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogRepository } from '../blog.repository';

export class DeleteBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogRepository: BlogRepository) {}
  // Удаление блогера
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const { blogId } = command;
    const isDeleteBlogById = await this.blogRepository.deleteBlogById(blogId);

    return isDeleteBlogById;
  }
}
