import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {Filter} from "@http4t/core/Filter";
import {Transaction} from "../transactions/TransactionPool";
import {handler} from "@http4t/core/handlers";

export function rollbackOnExceptionOr500(transaction: Transaction): Filter {
    return (decorated: HttpHandler): HttpHandler => {
        return handler(
            async (request: HttpRequest): Promise<HttpResponse> => {

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
