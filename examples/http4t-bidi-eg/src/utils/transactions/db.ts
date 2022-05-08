import {Transaction, TransactionPool} from "./TransactionPool";

export async function inTransaction<T>(transactionPool: TransactionPool, f: (t: Transaction) => T) {
    const transaction = await transactionPool.getTransaction();
    if (!transaction) throw new Error('No transaction.');
    try {
        await transaction.query('BEGIN');
        await f(transaction);
        await transaction.query('COMMIT');
    } catch (e) {
        await transaction.query('ROLLBACK');
        throw e;
    } finally {
        await transaction.release();
    }
}

export async function query(transactionPool: TransactionPool, query: string) {
    return inTransaction(transactionPool, t => t.query(query))
}

