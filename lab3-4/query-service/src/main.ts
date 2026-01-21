import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(LoggerService);

  const port = process.env.PORT || 8001;
  await app.listen(port);

  logger.log('Query Service started', { port });
}

bootstrap();
