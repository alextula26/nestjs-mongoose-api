import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SessionRepository } from '../session.repository';
import { SessionDocument } from '../schemas';

export class ResetAttemptSessionCommand {
  constructor(public sessionId: string) {}
}

@CommandHandler(ResetAttemptSessionCommand)
export class ResetAttemptSessionUseCase
  implements ICommandHandler<ResetAttemptSessionCommand>
{
  constructor(private readonly sessionRepository: SessionRepository) {}
  // Сбрасывание попытки обратиться к сессии в исходное состояние
  async execute(
    command: ResetAttemptSessionCommand,
  ): Promise<SessionDocument | null> {
    const { sessionId } = command;
    // Проверяем добавлена ли сессия с переданным идентификаторм
    const session = await this.sessionRepository.findSessionById(sessionId);
    // Если сессии с переданным идентификатором нет в базе, возвращаем ошибку 400
    if (!session) {
      return null;
    }
    // Сбрасываем поле attempt в исходное состояние
    session.resetAttempt();
    const updatedSession = await this.sessionRepository.save(session);
    return updatedSession;
  }
}
