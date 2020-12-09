import {TransactionPool} from "./TransactionPool";
import {query} from "./utils/db";

export async function migrate(transactionPool: TransactionPool): Promise<void> {
    await query(transactionPool, 'CREATE TABLE IF NOT EXISTS store (id varchar(64) primary key, document jsonb)');
}
