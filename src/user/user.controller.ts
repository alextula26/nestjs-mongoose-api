import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
  BadRequestException,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { AuthGuardBasic } from '../auth.guard';
import { CreateUserCommand } from './use-cases';
import { UserService } from './user.service';
import { UserQueryRepository } from './user.query.repository';

import { CreateUserDto } from './dto/user.dto';
import { ResponseViewModelDetail } from '../types';
import { QueryUserModel, UserViewModel } from './types';

@UseGuards(AuthGuardBasic)
@Controller('api/users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userService: UserService,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}
  // Получение списка пользователей
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllUsers(
    @Query() queryUserModel: QueryUserModel,
  ): Promise<ResponseViewModelDetail<UserViewModel>> {
    const allUsers = await this.userQueryRepository.findAllUsers(
      queryUserModel,
    );

    return allUsers;
  }
  // Создание пользователя
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserViewModel> {
    // Создаем пользователя
    const { userId, statusCode, statusMessage } = await this.commandBus.execute(
      new CreateUserCommand(createUserDto),
    );
    // Если при создании пользователя возникли ошибки возращаем статус и текст ошибки
    if (statusCode === HttpStatus.BAD_REQUEST) {
      throw new BadRequestException(statusMessage);
    }
    // Порлучаем созданного пользователя в формате ответа пользователю
    const foundUser = await this.userQueryRepository.findUserById(userId);
    // Возвращаем созданного пользователя
    return foundUser;
  }
  // Удалить пользователя
  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserById(@Param('userId') userId: string): Promise<boolean> {
    // Удаляем пользователя
    const isUserDeleted = await this.userService.deleteUserById(userId);
    // Если при удалении пользователь не был найден, возвращаем ошибку 404
    if (!isUserDeleted) {
      throw new NotFoundException();
    }
    // Иначе возвращаем true
    return isUserDeleted;
  }
}
