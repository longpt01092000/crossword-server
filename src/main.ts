import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as express from 'express';

import { AppModule } from './app.module';
import { setupSwagger } from '@infras/swagger.infras';
import { ExceptionInterceptor } from '@interceptors/exception.interceptor';
import { ResponseInterceptor } from '@interceptors/response.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  setupSwagger(app, configService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new ExceptionInterceptor(),
    new ResponseInterceptor(),
  );

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);
}
bootstrap();
