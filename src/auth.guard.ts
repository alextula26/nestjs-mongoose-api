import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { jwtService } from './application';
import { UserService } from './user/user.service';

@Injectable()
export class AuthGuardBasic implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request & any = context.switchToHttp().getRequest();
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
  constructor(private readonly userService: UserService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request & any = context.switchToHttp().getRequest();

    const authorization = request.headers.authorization;
    console.log('authorization', authorization);
    if (!authorization) {
      throw new UnauthorizedException();
    }

    const [authType, authToken] = authorization.split(' ');
    const userId = await jwtService.getUserIdByAccessToken(authToken);
    console.log('userId', userId);
    if (authType !== 'Bearer' || !userId) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    request.userId = userId;

    return true;
  }
}
