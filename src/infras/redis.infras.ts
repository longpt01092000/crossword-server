import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export const createRedisConnection = (
  configService: ConfigService,
): { connection: RedisOptions } => {
  const host = configService.get<string>('redis.host');
  const port = configService.get<number>('redis.port');
  const password = configService.get<string>('redis.password');

  const redisConfig: RedisOptions = {
    host,
    port,
    ...(password ? { password } : {}),
  };

  return {
    connection: redisConfig,
  };
};
