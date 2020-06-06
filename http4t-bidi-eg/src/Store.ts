import { Transaction} from "./TransactionPool";

export interface Store {
  get(id: string): any;
  save(id: string, document: object): Promise<any>;
}

export class PostgresStore implements Store {
  constructor(private transaction: Transaction) {
  }

  public async save(id: string, document: object): Promise<void> {
    if (!this.transaction) throw new Error('No transaction.');
    await this.transaction.query('INSERT INTO store values($1, $2) returning *', [id, document]);
  }

  public async get(id: string): Promise<any> {
    if (!this.transaction) throw new Error('No transaction.');
    const query = await this.transaction.query('SELECT * FROM store t WHERE t.id = $1', [id]);
    return query.rows[0];
  }
}