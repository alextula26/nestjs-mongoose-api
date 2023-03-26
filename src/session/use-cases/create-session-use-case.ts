import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateSessionDto } from '../dto/session.dto';
import { SessionRepository } from '../session.repository';
import { SessionDocument } from '../schemas';

export class CreateSessionCommand {
  constructor(public createSessionDto: CreateSessionDto) {}
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase
  implements ICommandHandler<CreateSessionCommand>
{
  constructor(private readonly sessionRepository: SessionRepository) {}
  // Добавление сессии
  async execute(command: CreateSessionCommand): Promise<SessionDocument> {
    const { createSessionDto } = command;
    // Получаем поля из DTO
    const { ip, deviceTitle, url } = createSessionDto;
    // Создаем документ сессии
    const madeSession = await this.sessionRepository.createSession({
      ip,
      deviceTitle,
      url,
    });
    // Сохраняем сессию в базе
    const createdSession = await this.sessionRepository.save(madeSession);
    // Возвращаем идентификатор созданного устройства
    return createdSession;
  }
}
