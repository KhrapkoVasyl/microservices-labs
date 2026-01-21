import { Collection } from 'mongodb';
import { MongoConnectionManager } from './mongodb-connection.manager';
import { IRepository } from './database.interface';

export class MongoRepository<
  T extends { [key: string]: any },
> implements IRepository<T> {
  private collection: Collection<T> | null = null;

  constructor(
    private readonly connectionManager: MongoConnectionManager,
    private readonly collectionName: string,
    private readonly idField: string = '_id',
  ) {}

  private getCollection(): Collection<T> {
    if (!this.collection) {
      this.collection = this.connectionManager
        .getDb()
        .collection<T>(this.collectionName);
    }
    return this.collection;
  }

  async findById(id: string): Promise<T | null> {
    const result = await this.getCollection().findOne({
      [this.idField]: id,
    } as any);
    return result as T | null;
  }

  async findAll(): Promise<T[]> {
    const results = await this.getCollection().find({}).toArray();
    return results as T[];
  }

  async save(entity: T): Promise<void> {
    await this.getCollection().insertOne(entity as any);
  }

  async update(id: string, updates: Partial<T>): Promise<void> {
    await this.getCollection().updateOne({ [this.idField]: id } as any, {
      $set: updates,
    });
  }

  async upsert(entity: T): Promise<void> {
    const id = entity[this.idField];
    await this.getCollection().updateOne(
      { [this.idField]: id } as any,
      { $set: entity },
      { upsert: true },
    );
  }

  async delete(id: string): Promise<void> {
    await this.getCollection().deleteOne({ [this.idField]: id } as any);
  }
}
