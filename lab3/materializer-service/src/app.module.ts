import { Module } from '@nestjs/common';
import { LoggerModule } from './common/logger/logger.module';
import { ConfigModule } from './common/config/config.module';
import { EventingModule } from './common/eventing/eventing.module';
import { DatabaseModule } from './common/database/database.module';
import { MaterializerModule } from './materializer/materializer.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot('MaterializerService'),
    EventingModule.forRoot({
      brokers: (process.env.KAFKA_BROKERS || 'localhost:29092').split(','),
      clientId: 'materializer-service',
      topic: process.env.KAFKA_TOPIC || 'compute-events',
      groupId: 'materializer-workers',
    }),
    DatabaseModule.forRoot({
      url: process.env.MONGO_URL || 'mongodb://localhost:27017',
      dbName: process.env.MONGO_DB || 'event_sourcing',
    }),
    MaterializerModule,
  ],
})
export class AppModule {}
