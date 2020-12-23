import {bufferText, TextHttpResponse} from "./buffered";
import {HttpHandler, HttpRequest} from "./contract";

/**
 * NB: Buffers request and response in to text, so will break response streaming for large bodies
 */
export class LoggingHttpHandler implements HttpHandler {
    constructor(private readonly decorated: HttpHandler) {
    }

    async handle(request: HttpRequest): Promise<TextHttpResponse> {
        const bufferedRequest = await bufferText(request);
        try {
            const response = await this.decorated.handle(bufferedRequest);
            const bufferedResponse = await bufferText(response);
            console.log("http", {request: bufferedRequest, response: bufferedResponse});
            return bufferedResponse;
        } catch (e) {
            console.error("http", {request: bufferedRequest, error: e});
            throw e;
        }
    }

}
