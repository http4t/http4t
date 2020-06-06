import { bufferText } from "@http4t/core/bodies";
import { request } from "@http4t/core/requests";
import { response } from "@http4t/core/responses";
import { Logger } from "./Logger";
import { HttpRequestWithCaptures, Route, RoutedHandlerFun, routes } from "./router";
import { Store } from "./Store";
import { HttpHandler, HttpRequest, HttpResponse } from "@http4t/core/contract";

function get(path: string, handler: RoutedHandlerFun): Route {
  return [request('GET', path), handler];
}

function post(path: string, handler: RoutedHandlerFun): Route {
  return [request('POST', path), handler];
}

function probeRoutes(logger: Logger) {
  return [
    get('/probe/ready', async () => {
      logger.info('probed ready');
      return response(200);
    }),
    get('/probe/live', async () => {
      logger.info('probed live');
      return response(200);
    })];
}

function storeRoutes(logger: Logger, store: Store) {
  return [
    post('/store', async (req: HttpRequestWithCaptures) => {
      logger.info('storing json');
      let body;
      try {
        body = JSON.parse(await bufferText(req.body));
      } catch (e) {
        return response(400, 'invalid json');
      }
      try {
        await store.save(body.id, body.document);
      } catch (e) {
        return response(400, 'unable to save document');
      }
      return response(201, body.id);
    }),
    get('/store/{id:.*}', async (req: HttpRequestWithCaptures) => {
      const id = req.path.id as string;
      const document = await store.get(id);
      if (!document)
        return response(404);

      logger.info(`retrieved json: "${JSON.stringify(document)}"`);

      return response(200, JSON.stringify(document))
    })
  ];
}

function testTransactionRoute(logger: Logger, store: Store): Route {
  return post('/test/store-then-throw', async (req) => {
    logger.info('throwing an exception');
    const text = await bufferText(req.body);
    const body = JSON.parse(text);
    await store.save(body.id, body.document);
    // Transaction should roll back
    throw new Error("Deliberate error");
  });
}


export class ExampleRouter implements HttpHandler {

  constructor(private store: Store, private logger: Logger) {
  }

  handle(request: HttpRequest): Promise<HttpResponse> {
    const composed = routes(
      ...probeRoutes(this.logger),
      ...storeRoutes(this.logger, this.store),
      testTransactionRoute(this.logger, this.store)
    );

    return composed.handle(request);
  }

}
