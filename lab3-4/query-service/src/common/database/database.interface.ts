export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<void>;
  update(id: string, updates: Partial<T>): Promise<void>;
  upsert(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IConnectionManager {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}
