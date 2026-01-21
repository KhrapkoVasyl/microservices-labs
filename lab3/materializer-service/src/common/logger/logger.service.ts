import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(private readonly context?: string) {}

  log(message: string, context?: any) {
    console.log(this.formatMessage('LOG', message, context));
  }

  error(message: string, trace?: string, context?: any) {
    console.error(this.formatMessage('ERROR', message, context), trace || '');
  }

  warn(message: string, context?: any) {
    console.warn(this.formatMessage('WARN', message, context));
  }

  debug(message: string, context?: any) {
    console.debug(this.formatMessage('DEBUG', message, context));
  }

  verbose(message: string, context?: any) {
    console.log(this.formatMessage('VERBOSE', message, context));
  }

  private formatMessage(level: string, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    const ctx = this.context ? `[${this.context}]` : '';
    const extra = context ? ` ${JSON.stringify(context)}` : '';
    return `${timestamp} ${level} ${ctx} ${message}${extra}`;
  }
}
