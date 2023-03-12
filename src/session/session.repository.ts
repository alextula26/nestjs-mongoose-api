import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument, SessionModelType } from './schemas';
import { MakeSessionModel } from './types';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}
  // Сохранение сессии в базе
  async save(user: SessionDocument): Promise<SessionDocument> {
    return await user.save();
  }
  // Поиск документа конкретной сессии по ее идентификатору
  async findSessionById(sessionId: string): Promise<SessionDocument | null> {
    const foundSession = await this.SessionModel.findOne({ id: sessionId });

    if (!foundSession) {
      return null;
    }

    return foundSession;
  }
  // Создаем документ сессии
  async createSession({
    ip,
    deviceTitle,
    url,
  }: MakeSessionModel): Promise<SessionDocument> {
    const madeSession = this.SessionModel.make(
      { ip, deviceTitle, url },
      this.SessionModel,
    );

    return madeSession;
  }
  // Удаление сессии
  async deleteAll(): Promise<boolean> {
    const { deletedCount } = await this.SessionModel.deleteMany({});

    return deletedCount === 1;
  }
}
