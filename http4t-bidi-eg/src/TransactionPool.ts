import {Pool, PoolClient} from "pg";

export interface Transaction {
  query(command: string, parameters?: any[]): Promise<any>

  release(): Promise<void>
}

export interface TransactionPool {
  stop(): Promise<void>

  getTransaction(): Promise<Transaction>
}

class PostgresTransaction implements Transaction {
  constructor(private client: PoolClient) {
  }

  async query(command: string, parameters: (string | number | boolean)[]): Promise<any> {
    return this.client.query(command, parameters)
  }

  async release(): Promise<void> {
    this.client.release();
  }
}

export class PostgresTransactionPool implements TransactionPool {
  constructor(private pool: Pool) {
  }

  public async stop() {
    await this.pool.end();
  }

  public async getTransaction(): Promise<Transaction> {
    return new PostgresTransaction(await this.pool.connect());
  }

}