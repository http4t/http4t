import { HttpHandler, HttpRequest } from "@http4t/core/contract";
import { httpInfoLogger } from "./log/HttpInfoLogger";
import { CumulativeLogger } from "./Logger";
import { handleError } from "./filters/errors";
import { inTransaction } from "./filters/transaction";
import { PostgresStore } from "./Store";
import { TransactionPool } from "./TransactionPool";
import { middlewares } from "./utils/Filter";
import { ExampleRouter } from "./routes";
import { migrate } from "./Db";

export class App implements HttpHandler {

  constructor(private transactionPool: TransactionPool) {}

  async handle(request: HttpRequest) {
    const transaction = await this.transactionPool.getTransaction();
    const store = new PostgresStore(transaction);
    const logger = new CumulativeLogger();

    const middleware = middlewares(
      inTransaction(transaction),
      httpInfoLogger(logger),
      handleError(logger));

    const handler = middleware(new ExampleRouter(store, logger));

    return handler.handle(request);
  };

  async start() {
    await migrate(this.transactionPool);
  }

  async stop() {
    await this.transactionPool.stop();
  }
}

