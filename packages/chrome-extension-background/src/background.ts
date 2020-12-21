import {bufferText} from "@http4t/core/bodies";
import {Uri} from "@http4t/core/uri";
import {FetchMessage, isFetchMessage} from "./FetchViaBackgroundScript";

/**
 * Run this in a background script
 */
export function startBackgroundListener() {
    chrome.runtime.onMessage.addListener((message: FetchMessage | any, sender, sendResponse) => {
        if (!isFetchMessage(message))
            return;
        const request = message.request;
        console.log("request", request);
        // see https://developer.chrome.com/docs/extensions/mv2/match_patterns/
        const uri = Uri.of(request.uri);
        const pattern = `${uri.scheme}://${uri.authority?.host}/*`;
        chrome.tabs.query({url: pattern}, (tabs) => {
            const tabId = tabs?.[0]?.id;
            if (!tabId)
                return;
            chrome.tabs.sendMessage(
                tabId,
                message,
                async (response) => {
                    const buffered = {...response, body: await bufferText(response.body)};
                    console.log("response", buffered);
                    sendResponse(buffered);
                });
        });
        return true;
    });
}
