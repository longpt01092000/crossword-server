import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

export function setupSwagger(
  app: INestApplication,
  configService: ConfigService,
) {
  const title = configService.get<string>('swagger.title') as string;
  const description = configService.get<string>(
    'swagger.description',
  ) as string;
  const version = configService.get<string>('swagger.version') as string;
  const path = configService.get<string>('swagger.path') as string;

  const configDocument = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, configDocument);
  SwaggerModule.setup(path || 'docs', app, document);
}
