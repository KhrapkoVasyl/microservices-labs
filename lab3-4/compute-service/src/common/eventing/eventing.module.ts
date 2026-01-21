import { Module, DynamicModule, Global } from '@nestjs/common';
import { KafkaConnectionManager } from './kafka-connection.manager';
import { KafkaProducer } from './kafka-producer.service';
import { KafkaConsumer } from './kafka-consumer.service';

export const EVENT_PRODUCER = Symbol('EVENT_PRODUCER');
export const EVENT_CONSUMER = Symbol('EVENT_CONSUMER');

export interface EventingModuleOptions {
  brokers: string[];
  clientId: string;
  topic: string;
  groupId?: string;
}

@Global()
@Module({})
export class EventingModule {
  static forRoot(options: EventingModuleOptions): DynamicModule {
    const connectionManager = new KafkaConnectionManager({
      brokers: options.brokers,
      clientId: options.clientId,
    });

    const producer = new KafkaProducer(connectionManager, {
      topic: options.topic,
    });

    const consumer = options.groupId
      ? new KafkaConsumer(connectionManager, {
          groupId: options.groupId,
          topic: options.topic,
        })
      : null;

    const providers: Array<{ provide: symbol; useValue: any }> = [
      {
        provide: EVENT_PRODUCER,
        useValue: producer,
      },
    ];

    if (consumer) {
      providers.push({
        provide: EVENT_CONSUMER,
        useValue: consumer,
      });
    }

    return {
      module: EventingModule,
      providers,
      exports: [EVENT_PRODUCER, EVENT_CONSUMER],
    };
  }
}
