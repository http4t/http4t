import {bufferText, TextHttpResponse} from "./buffered";
import {HttpHandler, HttpRequest} from "./contract";

/**
 * NB: Buffers request and response in to text, so will break response streaming for large bodies
 */
export class LoggingHttpHandler implements HttpHandler {
    constructor(private readonly decorated: HttpHandler) {
    }

    async handle(request: HttpRequest): Promise<TextHttpResponse> {
        if (!request) {
            console.error("http", {request: null})
            throw {message: "no request"}
        }
        const bufferedRequest = await bufferText(request);
        try {
            const response = await this.decorated.handle(bufferedRequest);
            if (!response) {
                // noinspection ExceptionCaughtLocallyJS
                throw {message: "no response"}
            }
            const bufferedResponse = await bufferText(response);
            console.log("http", {request: bufferedRequest, response: bufferedResponse});
            return bufferedResponse;
        } catch (e: any) {
            console.error("http", {request: bufferedRequest, error: e});
            throw e;
        }
    }

}
