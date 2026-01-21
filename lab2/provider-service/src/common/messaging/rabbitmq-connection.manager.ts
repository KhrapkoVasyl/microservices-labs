import { LoggerService } from '@common/logger';
import * as amqp from 'amqplib';

export interface RabbitMQConnectionOptions {
  url: string;
}

export class RabbitMQConnectionManager {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  constructor(
    private readonly url: string,
    private readonly logger: LoggerService,
    private readonly name: string = 'RabbitMQ',
  ) {}

  async connect(): Promise<amqp.Channel> {
    if (this.channel) return this.channel;

    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      this.logger.log(`${this.name} connected`, { url: this.url });

      return this.channel;
    } catch (error) {
      this.logger.error(`${this.name} failed to connect`, { error });
      throw error;
    }
  }

  async getChannel(): Promise<amqp.Channel> {
    if (!this.channel) {
      return this.connect();
    }
    return this.channel;
  }

  isConnected(): boolean {
    return this.channel !== null;
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      this.logger.log(`${this.name} disconnected`);
    } catch (error) {
      this.logger.error(`${this.name} error closing connection`, { error });
    }
  }
}
