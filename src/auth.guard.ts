import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadGatewayException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Request } from 'express';

import { SessionService } from './session/session.service';
import { jwtService } from './application';
import {
  CreateSessionCommand,
  IncreaseAttemptSessionCommand,
  ResetAttemptSessionCommand,
} from './session/use-cases';

@Injectable()
export class AuthGuardBasic implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException();
    }

    const [authType, authInBase64] = authorization.split(' ');
    const authToString = Buffer.from(authInBase64, 'base64').toString('utf8');
    const [login, password] = authToString.split(':');

    if (
      authType !== 'Basic' ||
      login !== process.env.LOGIN ||
      password !== process.env.PASSWORD
    ) {
      throw new UnauthorizedException();
    }

    return true;
  }
}

@Injectable()
export class AuthGuardBearer implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request & { userId: string } = context
      .switchToHttp()
      .getRequest();
    const authorization = request.headers.authorization;

    if (request.method === 'GET') {
      if (!authorization) {
        return true;
      }

      const [authType, authToken] = authorization.split(' ');
      const userId = await jwtService.getUserIdByAccessToken(authToken);

      if (authType !== 'Bearer' || !userId) {
        return true;
      }

      request.userId = userId;

      return true;
    }

    if (!authorization) {
      throw new UnauthorizedException();
    }

    const [authType, authToken] = authorization.split(' ');
    const userId = await jwtService.getUserIdByAccessToken(authToken);

    if (authType !== 'Bearer' || !userId) {
      throw new UnauthorizedException();
    }

    request.userId = userId;

    return true;
  }
}

@Injectable()
export class AuthGuardRefreshToken implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request & {
      userId: string;
      deviceId: string;
      deviceIat: string;
    } = context.switchToHttp().getRequest();

    if (!request.cookies || !request.cookies.refreshToken) {
      throw new UnauthorizedException();
    }

    const refreshTokenResponse =
      await jwtService.getRefreshTokenUserIdAndDeviceId(
        request.cookies.refreshToken,
      );

    if (
      !refreshTokenResponse ||
      !refreshTokenResponse.userId ||
      !refreshTokenResponse.deviceId
    ) {
      throw new UnauthorizedException();
    }

    request.userId = refreshTokenResponse.userId;
    request.deviceId = refreshTokenResponse.deviceId;
    request.deviceIat = refreshTokenResponse.iat;

    return true;
  }
}

@Injectable()
export class AuthCountRequests implements CanActivate {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly sessionService: SessionService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const url = request.url;
    const deviceTitle = request.headers['user-agent'] || '';

    const limitSecondsRate = 10;
    const maxAttemps = 5;

    const foundSession = await this.sessionService.findSession(
      ip,
      url,
      deviceTitle,
    );

    if (!foundSession) {
      await this.commandBus.execute(
        new CreateSessionCommand({ ip, url, deviceTitle }),
      );
      return true;
    }

    const currentLocalDate = Date.now();
    const sessionDate = new Date(foundSession.issuedAtt).getTime();
    const diffSeconds = (currentLocalDate - sessionDate) / 1000;

    if (diffSeconds > limitSecondsRate) {
      await this.commandBus.execute(
        new ResetAttemptSessionCommand(foundSession.id),
      );
      return true;
    }

    const response = await this.commandBus.execute(
      new IncreaseAttemptSessionCommand(foundSession.id),
    );

    if (!response) {
      throw new BadGatewayException();
    }

    if (response.attempt > maxAttemps) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
