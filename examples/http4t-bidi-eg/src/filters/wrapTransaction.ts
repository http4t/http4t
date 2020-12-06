import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {Filter} from "@http4t/core/Filter";
import {Transaction} from "../TransactionPool";
import {toHttpHandler} from "../utils/http";

export function wrapTransaction(transaction: Transaction): Filter {
    return (decorated: HttpHandler): HttpHandler => {
        return toHttpHandler(async (request: HttpRequest): Promise<HttpResponse> => {

            await transaction.query('BEGIN');
            try {
                const response = await decorated.handle(request);
                if (response.status === 500) {
                    await transaction.query('ROLLBACK');
                } else {
                    await transaction.query('COMMIT');
                }
                return response;
            } catch (e) {
                await transaction.query('ROLLBACK');
                throw e;
            } finally {
                await transaction.release();
            }
        })
    }
}
