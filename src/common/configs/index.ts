import { ConfigFactory } from '@nestjs/config';
import appConfig from './app.config';
import authConfig from './auth.config';
import docConfig from './doc.config';
import redisConfig from './redis.config';

const configs: ConfigFactory[] = [
  appConfig,
  authConfig,
  docConfig,
  redisConfig,
];

export default configs;
