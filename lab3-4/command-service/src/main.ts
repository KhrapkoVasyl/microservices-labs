import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });
  const logger = app.get(LoggerService);

  const port = process.env.PORT || 8000;
  await app.listen(port);

  logger.log('Command Service started', { port });
}

bootstrap();
