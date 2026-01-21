import { MongoClient, Db } from 'mongodb';
import { IConnectionManager } from './database.interface';

export interface MongoConnectionOptions {
  url: string;
  dbName: string;
}

export class MongoConnectionManager implements IConnectionManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  constructor(private readonly options: MongoConnectionOptions) {}

  async connect(): Promise<void> {
    if (!this.client) {
      this.client = new MongoClient(this.options.url);
      await this.client.connect();
      this.db = this.client.db(this.options.dbName);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  isConnected(): boolean {
    return this.client !== null;
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }
}
