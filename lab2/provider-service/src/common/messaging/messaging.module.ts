import { Module } from '@nestjs/common';
import { ConfigService } from '@common/config';
import { LoggerService } from '@common/logger';
import { RabbitMQService } from './rabbitmq-consumer.service';
import { MESSAGING_SERVICE } from './messaging.interface';

const COMPUTE_QUEUE = 'compute_queue';

@Module({
  providers: [
    {
      provide: MESSAGING_SERVICE,
      useFactory: (configService: ConfigService, logger: LoggerService) => {
        const url =
          configService.get('RABBITMQ_URL') || 'amqp://localhost:5672';
        return new RabbitMQService({ url, queue: COMPUTE_QUEUE }, logger);
      },
      inject: [ConfigService, LoggerService],
    },
  ],
  exports: [MESSAGING_SERVICE],
})
export class MessagingModule {}
