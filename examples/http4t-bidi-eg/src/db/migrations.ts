import {TransactionPool} from "../utils/transactions/TransactionPool";
import {query} from "../utils/transactions/db";

export async function migrate(transactionPool: TransactionPool): Promise<void> {
    await query(transactionPool, 'CREATE TABLE IF NOT EXISTS store (id varchar(64) primary key, owner varchar(64), document jsonb)');
}
