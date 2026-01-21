import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { LoggerService } from '@common/logger';
import { IMessageProducer, MessageProps } from './messaging.interface';
import { RabbitMQConnectionManager } from './rabbitmq-connection.manager';

export interface RabbitMQProducerOptions {
  url: string;
  queue: string;
}

@Injectable()
export class RabbitMQProducer implements IMessageProducer, OnModuleDestroy {
  private readonly connectionManager: RabbitMQConnectionManager;
  private readonly queue: string;

  constructor(
    private readonly options: RabbitMQProducerOptions,
    private readonly logger: LoggerService,
  ) {
    this.queue = options.queue;
    this.connectionManager = new RabbitMQConnectionManager(
      options.url,
      logger,
      'Producer',
    );
  }

  async onModuleDestroy() {
    await this.close();
  }

  async connect(): Promise<void> {
    const channel = await this.connectionManager.connect();
    await channel.assertQueue(this.queue, { durable: false });
  }

  async send<T>(message: T, options?: MessageProps): Promise<void> {
    const channel = await this.connectionManager.getChannel();

    channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(message)), {
      correlationId: options?.correlationId,
      replyTo: options?.replyTo,
    });
  }

  async close(): Promise<void> {
    await this.connectionManager.close();
  }
}
