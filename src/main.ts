import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ErrorExceptionFilter, HttpExceptionFilter } from './exception.filter';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory(errors) {
        throw new BadRequestException(
          errors.reduce((acc, e) => {
            const constraintsKeys = Object.keys(e.constraints);
            return [
              ...acc,
              ...constraintsKeys.map((ckey) => ({
                message: e.constraints[ckey],
                field: e.property,
              })),
            ];
          }, []),
        );
      },
    }),
  );
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());
  await app.listen(PORT);
}

bootstrap();
