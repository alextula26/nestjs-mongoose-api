import { Injectable } from '@nestjs/common';

import { PostRepository } from './post.repository';
import { PostDocument } from './schemas';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}
  // Поиск поста
  async findPostById(postId: string): Promise<PostDocument | null> {
    const foundPostById = await this.postRepository.findPostById(postId);

    return foundPostById;
  }
}
