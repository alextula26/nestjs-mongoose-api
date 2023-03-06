import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuardBasic } from '../auth.guard';
import { UserQueryRepository } from './user.query.repository';
import { UserService } from './user.service';
import { ResponseViewModelDetail } from '../types';
import { QueryUserModel, UserViewModel } from './types';
import { CreateUserDto } from './dto/user.dto';

@UseGuards(AuthGuardBasic)
@Controller('api/users')
export class UserController {
  constructor(
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
    const { userId, statusCode, statusMessage } =
      await this.userService.createUser(createUserDto);
    // Если при создании пользователя возникли ошибки возращаем статус ошибки
    if (statusCode !== HttpStatus.CREATED) {
      throw new HttpException(statusMessage, statusCode);
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
    // Если при удалении пользователя вернулись ошибка возвращаем ее
    if (!isUserDeleted) {
      throw new HttpException('User is not found', HttpStatus.NOT_FOUND);
    }
    // Иначе возвращаем true
    return isUserDeleted;
  }
}
