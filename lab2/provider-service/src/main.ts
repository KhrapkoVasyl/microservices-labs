import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from '@common/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });
  const logger = app.get(LoggerService);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log('Provider Service started', { port });
}

bootstrap();
