import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SessionService } from './session.service';
import {
  CreateSessionUseCase,
  IncreaseAttemptSessionUseCase,
  ResetAttemptSessionUseCase,
} from './use-cases';
import { SessionRepository } from './session.repository';
import { Session, SessionSchema } from './schemas/session.schema';

const useCases = [
  CreateSessionUseCase,
  IncreaseAttemptSessionUseCase,
  ResetAttemptSessionUseCase,
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
  ],
  providers: [SessionService, SessionRepository, ...useCases],
})
export class SessionModule {}
