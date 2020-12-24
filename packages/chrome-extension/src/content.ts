import {FetchHandler} from "@http4t/browser/fetch";
import {HttpHandler} from "@http4t/core/contract";
import {badGateway, ErrorAdapter} from "./ErrorAdapter";
import {FetchMessage, isFetchMessage} from "./FetchMessage";

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
                sendResponse(onError(message.request, err))
            })
        return true;
    });
}
