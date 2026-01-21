import { Module, DynamicModule, Global } from '@nestjs/common';
import { KafkaConnectionManager } from './kafka-connection.manager';
import { KafkaProducer } from './kafka-producer.service';

export const EVENT_PRODUCER = Symbol('EVENT_PRODUCER');

export interface EventingModuleOptions {
  brokers: string[];
  clientId: string;
  topic: string;
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

    return {
      module: EventingModule,
      providers: [
        {
          provide: EVENT_PRODUCER,
          useValue: producer,
        },
      ],
      exports: [EVENT_PRODUCER],
    };
  }
}
