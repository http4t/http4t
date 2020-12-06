import {buildRouter} from "@http4t/bidi/router";
import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {Closeable} from "@http4t/core/server";
import {Api, routes} from "./api";
import {handleError} from "./filters/errors";
import {wrapTransaction} from "./filters/wrapTransaction";
import {httpInfoLogger} from "./log/HttpInfoLogger";
import {CumulativeLogger} from "./Logger";
import {migrate} from "./migrations";
import {Doc, PostgresStore} from "./Store";
import {Transaction, TransactionPool} from "./TransactionPool";

function behaviour(transaction: Transaction, logger: CumulativeLogger): Api {
    const store = new PostgresStore(transaction);
    return {
        async live(): Promise<undefined> {
            logger.info('probed live');
            return undefined;
        },
        async ready(): Promise<undefined> {
            logger.info('probed ready');
            return undefined;
        },
        async get(request: { id: string }): Promise<Doc | undefined> {
            const doc = await store.get(request.id);
            logger.info(`retrieved json: "${JSON.stringify(doc)}"`);
            return doc;
        },
        async post(doc: Doc): Promise<{ id: string }> {
            logger.info(`storing json: "${JSON.stringify(doc)}"`);
            await store.save(doc);
            return {id: doc.id};
        },
        async test(doc: Doc): Promise<undefined> {
            logger.info('throwing an exception');
            await store.save(doc);
            throw new Error("Deliberate error");
        },
    };
}

function router(transaction: Transaction, logger: CumulativeLogger): HttpHandler {
    return buildRouter(routes, behaviour(transaction, logger));
}

export async function startApp(transactionPool: TransactionPool): Promise<HttpHandler & Closeable> {
    await migrate(transactionPool);
    const logger = new CumulativeLogger();

    return {
        async handle(request: HttpRequest): Promise<HttpResponse> {
            const transaction = await transactionPool.getTransaction();

            return httpInfoLogger(logger)(
                handleError(logger)(
                    wrapTransaction(transaction)(
                        router(transaction, logger))))
                .handle(request);
        },
        async close(): Promise<void> {
            await transactionPool.stop();
        }
    };
}
