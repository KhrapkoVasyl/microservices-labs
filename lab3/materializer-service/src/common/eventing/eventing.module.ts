import { Module, DynamicModule, Global } from '@nestjs/common';
import { KafkaConnectionManager } from '../../../../common/eventing/kafka-connection.manager';
import { KafkaConsumer } from '../../../../common/eventing/kafka-consumer.service';

export const EVENT_CONSUMER = Symbol('EVENT_CONSUMER');

export interface EventingModuleOptions {
  brokers: string[];
  clientId: string;
  topic: string;
  groupId: string;
}

@Global()
@Module({})
export class EventingModule {
  static forRoot(options: EventingModuleOptions): DynamicModule {
    const connectionManager = new KafkaConnectionManager({
      brokers: options.brokers,
      clientId: options.clientId,
    });

    const consumer = new KafkaConsumer(connectionManager, {
      groupId: options.groupId,
      topic: options.topic,
    });

    return {
      module: EventingModule,
      providers: [
        {
          provide: EVENT_CONSUMER,
          useValue: consumer,
        },
      ],
      exports: [EVENT_CONSUMER],
    };
  }
}
