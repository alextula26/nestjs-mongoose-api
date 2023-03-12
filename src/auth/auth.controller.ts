import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuardRefreshToken } from '../auth.guard';
import { AuthService } from './auth.service';
import { UserAuthViewModel } from './types';
import {
  AuthUserDto,
  ConfirmPasswordDto,
  RegistrationConfirmationDto,
  RegistrationEmailDto,
  RegistrationUserDto,
} from './dto';
import { AuthQueryRepository } from './auth.query.repository';
import { AuthAccessTokenModel } from './types/AuthUserModel';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authQueryRepository: AuthQueryRepository,
  ) {}
  // Получение данных о пользователе
  @Get('me')
  @UseGuards(AuthGuardRefreshToken)
  @HttpCode(HttpStatus.OK)
  async me(
    @Req() request: Request & { userId: string },
  ): Promise<UserAuthViewModel> {
    // Получаем конкретного аутентифицированного пользователя по его идентификатору
    const foundAuthUser = await this.authQueryRepository.findAuthUserById(
      request.userId,
    );
    // Если аутентифицированный пользователь не найден возвращаем ошибку
    if (!foundAuthUser) {
      throw new UnauthorizedException();
    }
    // Возвращаем аутентифицированного пользователя в формате ответа пользователю
    return foundAuthUser;
  }
  // Аутентификация пользователя
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() request: Request,
    @Ip() ip: string,
    @Body() authUserDto: AuthUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthAccessTokenModel> {
    const deviceTitle = request.headers['user-agent'] || '';
    const authUserTokens = await this.authService.checkCredentials(
      ip,
      deviceTitle,
      authUserDto,
    );
    // Если аутентифицированный пользователь не найден возвращаем ошибку 401
    if (!authUserTokens) {
      throw new UnauthorizedException();
    }
    const { accessToken, refreshToken } = authUserTokens;
    // Пишем новый refresh токен в cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    // Возвращаем сформированный access токен
    return { accessToken };
  }
  // logout пользователя
  @Post('/logout')
  @UseGuards(AuthGuardRefreshToken)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request & { userId: string; deviceId: string },
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const { statusCode } = await this.authService.logout(
      request.userId,
      request.deviceId,
    );
    // Если при logout возникли ошибки возращаем статус ошибки 401
    if (statusCode !== HttpStatus.NO_CONTENT) {
      throw new UnauthorizedException();
    }
    // Удаляем refresh токен из cookie
    response.clearCookie('refreshToken');
  }
  // Получить refresh токен
  @Post('refresh-token')
  @UseGuards(AuthGuardRefreshToken)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() request: Request & { userId: string; deviceId: string },
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthAccessTokenModel> {
    const authUserTokens = await this.authService.refreshToken(
      request.userId,
      request.deviceId,
    );
    // Если при logout возникли ошибки возращаем статус ошибки 401
    if (!authUserTokens) {
      throw new UnauthorizedException();
    }
    const { accessToken, refreshToken } = authUserTokens;
    // Пишем новый refresh токен в cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken };
  }
  // Регистрация пользователя
  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(
    @Body() registrationUserDto: RegistrationUserDto,
  ): Promise<void> {
    // Регестрируем пользователя
    const { statusCode, statusMessage } = await this.authService.registerUser(
      registrationUserDto,
    );
    // Если при регистрации пользователя возникли ошибки возращаем статус ошибки
    if (statusCode === HttpStatus.BAD_REQUEST) {
      throw new BadRequestException(statusMessage);
    }
  }
  // Подтверждение email по коду
  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body() registrationConfirmationDto: RegistrationConfirmationDto,
  ): Promise<void> {
    // Проверяем код подтверждения email
    const { statusCode, statusMessage } =
      await this.authService.registrationConfirmation(
        registrationConfirmationDto,
      );
    // Если при проверке кода подтверждения email возникли ошибки возвращаем статус и текст ошибки
    if (statusCode === HttpStatus.BAD_REQUEST) {
      throw new BadRequestException(statusMessage);
    }
  }
  // Повторная отправка кода подтверждения email
  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body() registrationEmailDto: RegistrationEmailDto,
  ): Promise<void> {
    // Повторно формируем код подтверждения email, обновляем код у пользователя и отправляем письмо
    const { statusCode, statusMessage } =
      await this.authService.registrationEmailResending(registrationEmailDto);
    // Если новый код подтверждения email не сформирован или не сохранен для пользователя или письмо не отправлено,
    // возвращаем статус 400
    if (statusCode === HttpStatus.BAD_REQUEST) {
      throw new BadRequestException(statusMessage);
    }
  }
  // Восстановление пароля с помощью подтверждения по электронной почте.
  @Post('/password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body() registrationEmailDto: RegistrationEmailDto,
  ): Promise<void> {
    // Повторно формируем код востановления пароля, обновляем код у пользователя и отправляем письмо
    const { statusCode, statusMessage } =
      await this.authService.passwordRecovery(registrationEmailDto);
    // Если код востановления пароля не сформирован или не сохранен для пользователя или письмо не отправлено,
    // возвращаем статус 400
    if (statusCode === HttpStatus.BAD_REQUEST) {
      throw new BadRequestException(statusMessage);
    }
  }
  // Подтверждение восстановление пароля
  @Post('/new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(
    @Body() confirmPasswordDto: ConfirmPasswordDto,
  ): Promise<void> {
    // Обновляем пароль пользователя
    const { statusCode, statusMessage } = await this.authService.newPassword(
      confirmPasswordDto,
    );
    // Если пароль не обновился возвращаем статус 400
    if (statusCode === HttpStatus.BAD_REQUEST) {
      throw new BadRequestException(statusMessage);
    }
  }
}
