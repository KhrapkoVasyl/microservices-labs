import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { LoggerService } from '@common/logger';
import { IRequestReplyClient } from './messaging.interface';
import { RabbitMQConnectionManager } from './rabbitmq-connection.manager';
import { v4 as uuidv4 } from 'uuid';

export interface RequestReplyOptions {
  url: string;
  queue: string;
  timeout?: number;
}

@Injectable()
export class RabbitMQRequestReplyClient
  implements IRequestReplyClient, OnModuleDestroy
{
  private readonly connectionManager: RabbitMQConnectionManager;
  private readonly queue: string;
  private readonly timeout: number;
  private replyQueue: string = '';
  private readonly pendingRequests = new Map<
    string,
    { resolve: (value: unknown) => void; reject: (reason: unknown) => void }
  >();

  constructor(
    private readonly options: RequestReplyOptions,
    private readonly logger: LoggerService,
  ) {
    this.queue = options.queue;
    this.timeout = options.timeout ?? 30000;
    this.connectionManager = new RabbitMQConnectionManager(
      options.url,
      logger,
      'RequestReplyClient',
    );
  }

  async onModuleDestroy() {
    await this.close();
  }

  async connect(): Promise<void> {
    const channel = await this.connectionManager.connect();

    // Assert the target queue for sending requests
    await channel.assertQueue(this.queue, { durable: false });

    // Create exclusive reply queue with auto-generated name
    const { queue: replyQueue } = await channel.assertQueue('', {
      exclusive: true,
    });
    this.replyQueue = replyQueue;

    // Listen for replies
    await channel.consume(
      this.replyQueue,
      (msg) => {
        if (msg) {
          const correlationId = msg.properties.correlationId;
          const pending = this.pendingRequests.get(correlationId);
          if (pending) {
            const response = JSON.parse(msg.content.toString());
            pending.resolve(response);
            this.pendingRequests.delete(correlationId);
          }
        }
      },
      { noAck: true },
    );

    this.logger.log('RequestReplyClient ready', {
      queue: this.queue,
      replyQueue: this.replyQueue,
    });
  }

  async sendAndReceive<T, R>(message: T): Promise<R> {
    const channel = await this.connectionManager.getChannel();

    // Ensure reply queue is set up
    if (!this.replyQueue) {
      await this.connect();
    }

    const correlationId = uuidv4();

    return new Promise<R>((resolve, reject) => {
      this.pendingRequests.set(correlationId, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });

      channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: this.replyQueue,
      });

      setTimeout(() => {
        if (this.pendingRequests.has(correlationId)) {
          this.pendingRequests.delete(correlationId);
          reject(new Error(`Request timeout after ${this.timeout}ms`));
        }
      }, this.timeout);
    });
  }

  async close(): Promise<void> {
    await this.connectionManager.close();
  }
}
