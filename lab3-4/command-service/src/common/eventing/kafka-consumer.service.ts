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

    console.log(
      `[KafkaConsumer] Subscribing to topic: ${this.options.topic}, groupId: ${this.options.groupId}`,
    );

    await consumer.subscribe({
      topic: this.options.topic,
      fromBeginning: false,
    });

    console.log(
      `[KafkaConsumer] Subscribed successfully, waiting for messages...`,
    );

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(
          `[KafkaConsumer] Received message from topic: ${topic}, partition: ${partition}, offset: ${message.offset}`,
        );

        if (message.value) {
          const event = JSON.parse(message.value.toString()) as Event;
          console.log(
            `[KafkaConsumer] Processing event: ${event.eventType}, aggregateId: ${event.aggregateId}`,
          );

          await handler(event);

          console.log(
            `[KafkaConsumer] Event processed successfully: ${event.eventId}`,
          );
        }
      },
    });
  }
}
