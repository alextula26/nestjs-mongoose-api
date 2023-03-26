import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LikeStatus, LikeStatusDocument, LikeStatusModelType } from './schemas';
import { LikeStatuses, PageType } from '../types';
import { MakeLikeStatusModel } from './types';

@Injectable()
export class LikeStatusRepository {
  constructor(
    @InjectModel(LikeStatus.name) private LikeStatusModel: LikeStatusModelType,
  ) {}
  // Сохранение лайк статуса в базе
  async save(likeStatus: LikeStatusDocument): Promise<LikeStatusDocument> {
    return await likeStatus.save();
  }
  // Создаем документ лайк статуса
  async createLikeStatus({
    parentId,
    userId,
    userLogin,
    likeStatus,
    pageType,
  }: MakeLikeStatusModel): Promise<LikeStatusDocument> {
    const madeLikeStatus = this.LikeStatusModel.make(
      { parentId, userId, userLogin, likeStatus, pageType },
      this.LikeStatusModel,
    );

    return madeLikeStatus;
  }
  // Поиск всех лайков
  async findLikes(): Promise<LikeStatusDocument[]> {
    const foundLikeStatus = await this.LikeStatusModel.find();

    return foundLikeStatus;
  }
  // Поиск лайк статус пользователя
  async findLikeStatusOfUser(
    userId: string,
    parentId: string,
    pageType: PageType,
  ): Promise<LikeStatusDocument | null> {
    const foundLikeStatus = await this.LikeStatusModel.findOne({
      parentId,
      userId,
      pageType,
    });

    if (!foundLikeStatus) {
      return null;
    }

    return foundLikeStatus;
  }
  // Поиск всех лайк статусов пользователя
  // В зависимости от типа страницы (комментарии / посты)
  async findLikeStatusesOfUser(
    userId: string,
    pageType: PageType,
  ): Promise<LikeStatusDocument[]> {
    const foundLikeStatuses = await this.LikeStatusModel.find({
      userId,
      pageType,
    });

    return foundLikeStatuses;
  }
  async getLikeStatusCount(
    parentId: string,
    pageType: PageType,
    likeStatus: LikeStatuses,
  ): Promise<number> {
    const count = await this.LikeStatusModel.countDocuments({
      parentId,
      pageType,
      likeStatus,
    });

    return count;
  }
  // Удаление лайка по идентификатору комментария или поста
  async deleteLikeStatusesByParentId(
    parentId: string,
    pageType: PageType,
  ): Promise<boolean> {
    await this.LikeStatusModel.deleteMany({
      parentId,
      pageType,
    });

    return true;
  }
  // Удаление коллекции
  async deleteAll(): Promise<boolean> {
    const { deletedCount } = await this.LikeStatusModel.deleteMany({});

    return deletedCount === 1;
  }
}
