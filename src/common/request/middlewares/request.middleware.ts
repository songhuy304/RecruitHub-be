import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { APP_ENVIRONMENT } from '@/common/enums';

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private readonly isDev: boolean;


  constructor(
    private readonly configService: ConfigService,
  ) {
    const env = this.configService.get<APP_ENVIRONMENT>('app.env');
    this.isDev =
      env === APP_ENVIRONMENT.LOCAL || env === APP_ENVIRONMENT.DEVELOPMENT;

  }

  use(req: Request, res: Response, next: NextFunction) {
    if (!this.isDev) {
      return next();
    }

    const { method, originalUrl } = req;

    res.on('finish', () => {
      const { statusCode } = res;

      this.logger.log(`${method} ${originalUrl} ${statusCode}`);
    });

    next();
  }
}
