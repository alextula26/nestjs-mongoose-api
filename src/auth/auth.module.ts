import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthQueryRepository } from './auth.query.repository';
import { AuthService } from './auth.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, AuthQueryRepository],
})
export class AuthModule {}
