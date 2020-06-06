import { HttpHandler, HttpRequest, HttpResponse } from "@http4t/core/contract";
import { response } from "@http4t/core/responses";
import { toHttpHandler } from "../utils/http";
import { Logger } from "../Logger";
import { Filter } from "../utils/Filter";

export function handleError(log: Logger): Filter {
  return (decorated: HttpHandler): HttpHandler => {
    return toHttpHandler(async (request: HttpRequest): Promise<HttpResponse> => {
      try {
        return await decorated.handle(request);
      } catch (e) {
        log.info(`${e}`);
        return response(500, JSON.stringify({message: e.message}));
      }
    })
  }
}