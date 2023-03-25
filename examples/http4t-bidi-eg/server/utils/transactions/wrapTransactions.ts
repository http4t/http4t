import {Transaction} from "./TransactionPool";
import {AsyncApi, decorate} from "../decorate";

export function wrapTransactions<T extends object>(api: T, transaction: Transaction): AsyncApi<T> {
    return decorate(
        api,
        {
            beforeExecution: () => transaction.query('BEGIN'),
            afterSuccess: () => transaction.query('COMMIT'),
            onException: () => transaction.query('ROLLBACK'),
            finally: () => transaction.release()
        });
}