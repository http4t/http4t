import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {Filter} from "@http4t/core/Filter";
import {responseOf} from "@http4t/core/responses";
import {Logger} from "../Logger";
import {handler} from "@http4t/core/handlers";

export function handleError(log: Logger): Filter {
    return (decorated: HttpHandler): HttpHandler => {
        return handler(async (request: HttpRequest): Promise<HttpResponse> => {
            try {
                return await decorated.handle(request);
            } catch (e: any) {
                const message = e.message || `${e}`;
                log.info(`Unhandled HttpHandler exception ${message}`);
                return responseOf(500, JSON.stringify({message}));
            }
        })
    }
}
