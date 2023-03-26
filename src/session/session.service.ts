import { Injectable } from '@nestjs/common';

import { SessionRepository } from './session.repository';
import { SessionDocument } from './schemas';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}
  // Поиск сессии по ip адресу, урлу и названию устройства
  async findSession(
    ip: string,
    url: string,
    deviceTitle: string,
  ): Promise<SessionDocument | null> {
    const foundSession = await this.sessionRepository.findSession(
      ip,
      url,
      deviceTitle,
    );

    return foundSession;
  }
}
