import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response, Application } from 'express';
const express = require('express');

import { AppModule } from './app.module';
import { setupSwagger } from './infras/swagger.infras';
import { ExceptionInterceptor } from './interceptors/exception.interceptor';
import { ResponseInterceptor } from './interceptors/response.interceptor';

let cachedApp: Application | undefined;

async function createNestApp() {
  if (cachedApp) return cachedApp;

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);
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

  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

// For Vercel deployment
export default async function handler(req: Request, res: Response) {
  const app = await createNestApp();
  return app(req, res);
}

// For local development
async function bootstrap() {
  const app = await createNestApp();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Application is running on: http://localhost:${port}`);
  });
}

// Only run bootstrap in development
if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}
