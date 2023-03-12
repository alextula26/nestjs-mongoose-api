import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (process.env.NODE_ENV !== 'production') {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        error: exception.toString(),
        stack: exception.stack.toString(),
      });
    } else {
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Some error ocurred');
    }
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    console.log('HttpExceptionFilter');
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    console.log('status', status);
    if (status === HttpStatus.BAD_REQUEST) {
      const responseBody: any = exception.getResponse();
      console.log('responseBody', responseBody);
      response.status(status).json({ errorsMessages: responseBody.message });
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
