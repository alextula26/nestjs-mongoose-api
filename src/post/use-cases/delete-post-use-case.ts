import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostRepository } from '../post.repository';
import { LikeStatusRepository } from '../../likeStatus/likeStatus.repository';
import { PageType } from '../../types';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly likeStatusRepository: LikeStatusRepository,
  ) {}
  // Обновление блогера
  async execute(command: DeletePostCommand): Promise<boolean> {
    const { postId } = command;
    const isDeletePostById = await this.postRepository.deletePostById(postId);

    await this.likeStatusRepository.deleteLikeStatusesByParentId(
      postId,
      PageType.POST,
    );

    return isDeletePostById;
  }
}
