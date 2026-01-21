import { Module } from '@nestjs/common';
import { LoggerModule } from './common/logger/logger.module';
import { ConfigModule } from './common/config/config.module';
import { DatabaseModule } from './common/database/database.module';
import { QueryModule } from './query/query.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot('QueryService'),
    DatabaseModule.forRoot({
      url: process.env.MONGO_URL || 'mongodb://localhost:27017',
      dbName: process.env.MONGO_DB || 'event_sourcing',
    }),
    QueryModule,
    HealthModule,
  ],
})
export class AppModule {}
