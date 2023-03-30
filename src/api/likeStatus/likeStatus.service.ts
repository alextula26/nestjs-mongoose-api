import { Injectable } from '@nestjs/common';

import { LikeStatuses, PageType } from '../../types';

import { LikeStatusRepository } from './likeStatus.repository';

@Injectable()
export class LikeStatusService {
  constructor(private readonly likeStatusRepository: LikeStatusRepository) {}
  // Получить лайк статус пользователя
  async getLikeStatusOfUser(
    userId: string | null,
    parentId: string,
    pageType: PageType,
  ): Promise<LikeStatuses> {
    if (!userId) {
      return LikeStatuses.NONE;
    }

    const foundLikeStatusOfUser =
      await this.likeStatusRepository.findLikeStatusOfUser(
        userId,
        parentId,
        pageType,
      );

    if (!foundLikeStatusOfUser) {
      return LikeStatuses.NONE;
    }

    return foundLikeStatusOfUser.likeStatus;
  }
}
