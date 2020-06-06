import {query} from "./utils/db";
import {TransactionPool} from "./TransactionPool";

export async function migrate(transactionPool: TransactionPool): Promise<void> {
  await query(transactionPool, 'CREATE TABLE IF NOT EXISTS store (id varchar(64) primary key, document jsonb)');
}