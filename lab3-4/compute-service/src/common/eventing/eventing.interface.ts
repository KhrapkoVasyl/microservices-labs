export interface Event<T = any> {
  eventId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  timestamp: Date;
  data: T;
}

export interface IEventProducer {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish<T>(event: Event<T>): Promise<void>;
}

export interface IEventConsumer {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(handler: (event: Event) => Promise<void>): Promise<void>;
}
