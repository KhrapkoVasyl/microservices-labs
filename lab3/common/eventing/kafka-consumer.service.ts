import { KafkaConnectionManager } from './kafka-connection.manager';
import { Event, IEventConsumer } from './eventing.interface';

export interface KafkaConsumerOptions {
  groupId: string;
  topic: string;
}

export class KafkaConsumer implements IEventConsumer {
  constructor(
    private readonly connectionManager: KafkaConnectionManager,
    private readonly options: KafkaConsumerOptions,
  ) {}

  async connect(): Promise<void> {
    await this.connectionManager.getConsumer(this.options.groupId);
  }

  async disconnect(): Promise<void> {
    await this.connectionManager.disconnect();
  }

  async subscribe(handler: (event: Event) => Promise<void>): Promise<void> {
    const consumer = await this.connectionManager.getConsumer(
      this.options.groupId,
    );

    await consumer.subscribe({
      topic: this.options.topic,
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value) {
          const event = JSON.parse(message.value.toString()) as Event;
          await handler(event);
        }
      },
    });
  }
}
