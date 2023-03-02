import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { BlogRepository } from '../blog/blog.repository';
import { PostRepository } from '../post/post.repository';
import { CommentRepository } from '../comment/comment.repository';

@Controller('api/testing')
export class TestingController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly blogRepository: BlogRepository,
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
  ) {}
  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAlld() {
    await this.userRepository.deleteAll();
    await this.blogRepository.deleteAll();
    await this.postRepository.deleteAll();
    await this.commentRepository.deleteAll();
  }
}
