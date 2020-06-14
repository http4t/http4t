import {HttpHandler} from "@http4t/core/contract";

export type Filter = (decorated: HttpHandler) => HttpHandler;

export function middlewares(...ms: Filter[]): Filter {
    return (handler: HttpHandler): HttpHandler => {
        return ms.reduce((handler, m) => m(handler), handler);
    }
}