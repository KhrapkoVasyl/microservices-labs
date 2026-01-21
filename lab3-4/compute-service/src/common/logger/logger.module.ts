import { Module, DynamicModule, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(context: string): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LoggerService,
          useValue: new LoggerService(context),
        },
      ],
      exports: [LoggerService],
    };
  }
}
