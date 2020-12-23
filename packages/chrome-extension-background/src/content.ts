import {FetchHandler} from "@http4t/browser/fetch";
import {HttpHandler, HttpResponse} from "@http4t/core/contract";
import {FetchMessage, isFetchMessage} from "./FetchMessage";

export type ErrorAdapter = (err: any) => HttpResponse & { err: any }
export const badGateway: ErrorAdapter =
    err => {
        return {
            status: 502,
            headers: [],
            body: "Problem in @http4t/chrome-extension-background content page: " + (err.message || JSON.stringify(err)),
            err
        };
    }

/**
 * Handles requests sent by a background script which has called {@link startBackgroundListener}
 */
export function startContentPageListener(
    http: HttpHandler = new FetchHandler(),
    onError: ErrorAdapter = badGateway) {
    chrome.runtime.onMessage.addListener((message: FetchMessage | any, sender, sendResponse) => {
        if (!isFetchMessage(message))
            return;

        http
            .handle(message.request)
            .then(sendResponse)
            .catch(err => {
                sendResponse(onError(err))
            })
        return true;
    });
}
