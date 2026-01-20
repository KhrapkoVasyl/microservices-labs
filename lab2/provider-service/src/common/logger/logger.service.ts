import {
  Injectable,
  LoggerService as NestLoggerService,
  Logger,
} from '@nestjs/common';

export type LogContext = Record<string, unknown>;

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: Logger;

  constructor(context?: string) {
    this.logger = new Logger(context ?? 'App');
  }

  log(message: string, context?: LogContext): void {
    this.logger.log(this.formatMessage(message, context));
  }

  error(message: string, context?: LogContext): void {
    this.logger.error(this.formatMessage(message, context));
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.formatMessage(message, context));
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(this.formatMessage(message, context));
  }

  private formatMessage(message: string, context?: LogContext): string {
    if (!context || Object.keys(context).length === 0) {
      return message;
    }
    return `${message} ${JSON.stringify(context)}`;
  }
}
