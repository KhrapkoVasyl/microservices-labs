import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = app.get(LoggerService);

  logger.log('Materializer Service started');

  process.on('SIGTERM', async () => {
    logger.log('Received SIGTERM, shutting down...');
    await app.close();
  });
}

bootstrap();
