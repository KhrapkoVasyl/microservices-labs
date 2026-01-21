import { Module } from '@nestjs/common';
import { ConfigService } from '@common/config';
import { LoggerService } from '@common/logger';
import { RabbitMQRequestReplyClient } from './rabbitmq-request-reply.service';

const COMPUTE_QUEUE = 'compute_queue';
export const REQUEST_REPLY_CLIENT = 'REQUEST_REPLY_CLIENT';

@Module({
  providers: [
    {
      provide: REQUEST_REPLY_CLIENT,
      useFactory: (configService: ConfigService, logger: LoggerService) => {
        const url =
          configService.get('RABBITMQ_URL') || 'amqp://localhost:5672';
        return new RabbitMQRequestReplyClient(
          { url, queue: COMPUTE_QUEUE },
          logger,
        );
      },
      inject: [ConfigService, LoggerService],
    },
  ],
  exports: [REQUEST_REPLY_CLIENT],
})
export class MessagingModule {}
