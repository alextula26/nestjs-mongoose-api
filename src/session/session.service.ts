import { HttpStatus, Injectable } from '@nestjs/common';
import { SessionRepository } from './session.repository';
import { validateOrRejectModel } from '../validate';
import { CreateSessionDto } from './dto';
import { SessionDocument } from './schemas';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}
  // Добавление сессии
  async createSession(createSessionDto: CreateSessionDto): Promise<{
    sessionId: string;
    statusCode: HttpStatus;
    statusMessage: string;
  }> {
    await validateOrRejectModel(createSessionDto, CreateSessionDto);

    const { ip, deviceTitle, url } = createSessionDto;
    // Создаем документ сессии
    const madeSession = await this.sessionRepository.createSession({
      ip,
      deviceTitle,
      url,
    });
    // Сохраняем сессию в базе
    const createdSession = await this.sessionRepository.save(madeSession);
    // Ищем созданную сессию в базе
    const foundSession = await this.sessionRepository.findSessionById(
      createdSession.id,
    );
    // Если сессии нет, т.е. она не сохранилась в базе, возвращаем ошибку
    if (!foundSession) {
      return {
        sessionId: null,
        statusCode: HttpStatus.BAD_REQUEST,
        statusMessage: `Session creation error`,
      };
    }
    // Возвращаем идентификатор созданного устройства и статус CREATED
    return {
      sessionId: createdSession.id,
      statusCode: HttpStatus.CREATED,
      statusMessage: 'Session created',
    };
  }
  // Обновление попытки обратится к сессии
  async increaseAttempt(sessionId: string): Promise<SessionDocument | null> {
    // Проверяем добавлена ли сессия с переданным идентификаторм
    const session = await this.sessionRepository.findSessionById(sessionId);
    // Если сессии с переданным идентификатором нет в базе, возвращаем ошибку 400
    if (session) {
      return null;
    }
    // Увеличиваем поле attempt на единицу
    session.increaseAttempt();
    const updatedSession = await this.sessionRepository.save(session);
    return updatedSession;
  }
  // Сбрасывание попытки обратиться к сессии в исходное состояние
  async resetAttempt(sessionId: string): Promise<SessionDocument | null> {
    // Проверяем добавлена ли сессия с переданным идентификаторм
    const session = await this.sessionRepository.findSessionById(sessionId);
    // Если сессии с переданным идентификатором нет в базе, возвращаем ошибку 400
    if (session) {
      return null;
    }
    // Сбрасываем поле attempt в исходное состояние
    session.resetAttempt();
    const updatedSession = await this.sessionRepository.save(session);
    return updatedSession;
  }
}
