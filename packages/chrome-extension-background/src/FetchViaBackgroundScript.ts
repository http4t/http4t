import {bufferText} from "@http4t/core/bodies";
import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";

export type FetchMessage = { msg: "fetch", request: HttpRequest };

export function isFetchMessage(value: any): value is FetchMessage {
    return value && value["msg"] === "fetch";
}

/**
 * Routes a request to a tab running the same
 *
 * background script, which has called startBackgroundListener()
 *
 * The background script will send
 */
export class FetchViaBackgroundScript implements HttpHandler {
    async handle(request: HttpRequest): Promise<HttpResponse> {
        return new Promise((resolve) => {
            console.log("request", request);
            chrome.runtime.sendMessage(
                undefined as any,
                {
                    msg: "fetch",
                    request
                },
                {},
                async response => {
                    const buffered = {...response, body: await bufferText(response.body)};
                    console.log("response", buffered)
                    resolve(buffered);
                });
        })
    }
}


