import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import express from 'express';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import setupSwagger from './swagger';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const server = express();
  let app: INestApplication;

  // // Tạo logger của Nest
  // const logger = new Logger('Bootstrap');

  try {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      bufferLogs: true,
    });

    const config = app.get(ConfigService);

    const port = config.get<number>('app.http.port');
    const host = config.get<string>('app.http.host');
    const version = config.get<string>('app.versioning.version');

    const logger = app.get(Logger);

    app.setGlobalPrefix('api');
    app.enableCors(config.get('app.cors'));
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: version ?? '1',
      prefix: config.get<string>('app.versioning.prefix'),
    });

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    );

    setupSwagger(app);

    await app.listen(port, host);

    logger.log(`Server running on: ${await app.getUrl()}`);
  } catch (error) {
    // logger.error('Server failed to start', error instanceof Error ? error.stack : String(error));
    console.log('Server failed to start', error instanceof Error ? error.stack : String(error));

    if (app) {
      await app.close();
    }

    process.exit(1);
  }
}

void bootstrap();