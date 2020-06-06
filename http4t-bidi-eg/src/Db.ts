import {Transaction, TransactionPool} from "./TransactionPool";

async function query(transaction: Transaction, query: string) {
  try {
    await transaction.query('BEGIN');
    await transaction.query(query);
    await transaction.query('COMMIT');
  } catch (e) {
    await transaction.query('ROLLBACK');
    throw e;
  } finally {
    await transaction.release();
  }
}

export async function migrate(transactionPool: TransactionPool): Promise<void> {
  const transaction: Transaction = await transactionPool.getTransaction();
  if (!transaction) throw new Error('No transaction.');

  await query(transaction, 'CREATE TABLE IF NOT EXISTS store (id varchar(64) primary key, document jsonb)');
}