import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {Logger} from "./Logger";
import {Filter} from "@http4t/core/Filter";

export function httpInfoLogger(logger: Logger): Filter {
    return (handler: HttpHandler) => new HttpInfoLogger(handler, logger);
}

export class HttpInfoLogger implements HttpHandler {
    constructor(private handler: HttpHandler, private logger:  Logger) {
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        this.logger.info(`Received ${request.method} to ${request.uri.path}`);
        try {
            const response = await this.handler.handle(request);
            this.logger.info(`Responded ${response.status} \n`);
            return response;
        } catch (e: any) {
            this.logger.info(`Threw error ${e} \n`);
            throw e;
        } finally {
            this.logger.flush();
        }
    }

}
