import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Ban, BanDocument, BanModelType } from './schemas';
import { MakeBanModel } from './types';

@Injectable()
export class BanRepository {
  constructor(@InjectModel(Ban.name) private BanModel: BanModelType) {}
  // Сохранение бана пользователя в базе
  async save(blog: BanDocument): Promise<BanDocument> {
    return await blog.save();
  }
  // Поиск документа забаненного пользователя по его идентификатору
  async findBanUserById(
    userId: string,
    blogId: string,
  ): Promise<BanDocument | null> {
    const foundbanUser = await this.BanModel.findOne({ userId, blogId });

    if (!foundbanUser) {
      return null;
    }

    return foundbanUser;
  }
  // Создание документа забаненного пользователя
  async createBanUser({
    userId,
    login,
    blogId,
    blogName,
    isBanned,
    banReason,
  }: MakeBanModel): Promise<BanDocument> {
    const madeBan = this.BanModel.make(
      { userId, login, blogId, blogName, isBanned, banReason },
      this.BanModel,
    );

    return madeBan;
  }
  // Удаление пользователя из бана
  async deleteBanUserById(userId: string): Promise<boolean> {
    const { deletedCount } = await this.BanModel.deleteOne({ userId });

    return deletedCount === 1;
  }
  // Удаление коллекции
  async deleteAll(): Promise<boolean> {
    const { deletedCount } = await this.BanModel.deleteMany({});

    return deletedCount === 1;
  }
}
