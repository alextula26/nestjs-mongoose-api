import { Injectable } from '@nestjs/common';

import { BlogRepository } from './blog.repository';
import { BlogDocument } from './schemas';

@Injectable()
export class BlogService {
  constructor(private readonly blogRepository: BlogRepository) {}
  // Получение конкретного блогера по его идентификатору
  async findBlogById(id: string): Promise<BlogDocument | null> {
    const foundBlogById = await this.blogRepository.findBlogById(id);

    return foundBlogById;
  }
}
