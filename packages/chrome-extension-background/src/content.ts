import {FetchHandler} from "@http4t/browser/fetch";
import {bufferText} from "@http4t/core/bodies";
import {FetchMessage, isFetchMessage} from "./FetchViaBackgroundScript";

/**
 * Run this in a content script that has permissions to run in tabs for the target host
 */
export function startContentPageListener() {
    chrome.runtime.onMessage.addListener((message: FetchMessage | any, sender, sendResponse) => {
        if (!isFetchMessage(message))
            return;
        new FetchHandler({credentials: "same-origin"})
            .handle(message.request)
            .then(async response => {
                const buffered = {...response, body: await bufferText(response.body)};
                console.log("response", buffered)
                sendResponse(buffered);
            })
            .catch(err => {
                console.error(err);
                sendResponse({status: 418, body: "Problem in target content page: " + err.message})
            })
        return true;
    });
}
