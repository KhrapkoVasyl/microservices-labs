import { KafkaConnectionManager } from './kafka-connection.manager';
import { Event, IEventProducer } from './eventing.interface';

export interface KafkaProducerOptions {
  topic: string;
}

export class KafkaProducer implements IEventProducer {
  constructor(
    private readonly connectionManager: KafkaConnectionManager,
    private readonly options: KafkaProducerOptions,
  ) {}

  async connect(): Promise<void> {
    await this.connectionManager.getProducer();
  }

  async disconnect(): Promise<void> {
    await this.connectionManager.disconnect();
  }

  async publish<T>(event: Event<T>): Promise<void> {
    const producer = await this.connectionManager.getProducer();
    await producer.send({
      topic: this.options.topic,
      messages: [
        {
          key: event.aggregateId,
          value: JSON.stringify(event),
        },
      ],
    });
  }
}
