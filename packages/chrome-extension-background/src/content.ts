import {FetchHandler} from "@http4t/browser/fetch";
import {bufferText} from "@http4t/core/bodies";
import {HttpHandler} from "@http4t/core/contract";
import {FetchMessage, isFetchMessage} from "./FetchViaBackgroundScript";

/**
 * Run this in a content script that has permissions to run in tabs for the target host
 */
export function startContentPageListener(http: HttpHandler = new FetchHandler()) {
    chrome.runtime.onMessage.addListener((message: FetchMessage | any, sender, sendResponse) => {
        if (!isFetchMessage(message))
            return;
        http
            .handle(message.request)
            .then(async response => {
                const buffered = {...response, body: await bufferText(response.body)};
                sendResponse(buffered);
            })
            .catch(err => {
                console.error(err);
                sendResponse({status: 418, body: "Problem in target content page: " + err.message})
            })
        return true;
    });
}
