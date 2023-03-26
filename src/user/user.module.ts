import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserUseCase } from './use-cases';
import { UserRepository } from './user.repository';
import { UserQueryRepository } from './user.query.repository';
import { User, UserSchema } from './schemas/user.schema';

const useCases = [CreateUserUseCase];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CqrsModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserQueryRepository, ...useCases],
})
export class UserModule {}
