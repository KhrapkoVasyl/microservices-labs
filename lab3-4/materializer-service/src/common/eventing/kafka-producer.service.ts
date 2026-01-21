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
    console.log(
      `[KafkaProducer] Publishing event: ${event.eventType}, aggregateId: ${event.aggregateId}, topic: ${this.options.topic}`,
    );

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

    console.log(
      `[KafkaProducer] Event published successfully: ${event.eventId}`,
    );
  }
}
