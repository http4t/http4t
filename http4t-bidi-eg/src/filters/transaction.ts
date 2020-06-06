import { HttpHandler, HttpRequest, HttpResponse } from "@http4t/core/contract";
import { toHttpHandler } from "../utils/http";
import { Transaction } from "../TransactionPool";
import { Filter } from "../utils/Filter";

export function inTransaction(transaction: Transaction): Filter {
  return (decorated: HttpHandler): HttpHandler => {
    return toHttpHandler(async (request: HttpRequest): Promise<HttpResponse> => {
      await transaction.query('BEGIN');
      try {
        const response = await decorated.handle(request);
        await transaction.query('COMMIT');
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