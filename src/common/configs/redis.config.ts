import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => {
  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
  return {
    url: redisUrl,
    port: process.env.REDIS_PORT ?? 6379,
    host: process.env.REDIS_HOST ?? 'localhost',
    password: process.env.REDIS_PASSWORD ?? undefined,
    tls: redisUrl.startsWith('rediss://') ? {} : null,
  };
});
