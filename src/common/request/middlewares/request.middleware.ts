import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { APP_ENVIRONMENT } from '@/common/enums';

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  private readonly isDev: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    const env = this.configService.get<APP_ENVIRONMENT>('app.env');
    this.isDev =
      env === APP_ENVIRONMENT.LOCAL || env === APP_ENVIRONMENT.DEVELOPMENT;
    this.logger.setContext(RequestMiddleware.name);
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (!this.isDev) {
      return next();
    }

    const { method, originalUrl } = req;

    res.on('finish', () => {
      const { statusCode } = res;

      this.logger.info(
        {
          method,
          url: originalUrl,
          statusCode,
        },
        `${method} ${originalUrl} ${statusCode}`,
      );
    });

    next();
  }
}
