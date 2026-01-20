import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  get(key: string): string | undefined {
    return process.env[key];
  }

  getOrThrow(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
  }
}
