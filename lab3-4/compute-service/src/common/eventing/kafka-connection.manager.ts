import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';

export interface KafkaConnectionOptions {
  brokers: string[];
  clientId: string;
}

export class KafkaConnectionManager {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;

  constructor(private readonly options: KafkaConnectionOptions) {
    this.kafka = new Kafka({
      clientId: options.clientId,
      brokers: options.brokers,
      logLevel: logLevel.WARN,
    });
  }

  async getProducer(): Promise<Producer> {
    if (!this.producer) {
      this.producer = this.kafka.producer();
      await this.producer.connect();
    }
    return this.producer;
  }

  async getConsumer(groupId: string): Promise<Consumer> {
    if (!this.consumer) {
      this.consumer = this.kafka.consumer({ groupId });
      await this.consumer.connect();
    }
    return this.consumer;
  }

  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
      this.producer = null;
    }
    if (this.consumer) {
      await this.consumer.disconnect();
      this.consumer = null;
    }
  }
}
