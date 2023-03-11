import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { jwtService } from './application';

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
    const request: Request & { userId: string; deviceId: string } = context
      .switchToHttp()
      .getRequest();
    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const result = await jwtService.getRefreshTokenUserIdAndDeviceId(
      refreshToken,
    );

    if (!result.userId || !result.deviceId) {
      throw new UnauthorizedException();
    }

    request.userId = result.userId;
    request.deviceId = result.deviceId;

    return true;
  }
}
