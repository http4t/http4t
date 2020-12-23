import {bufferText} from "@http4t/core/bodies";
import {HttpRequest} from "@http4t/core/contract";
import {Uri} from "@http4t/core/uri";
import {FetchMessage, isFetchMessage} from "./FetchViaBackgroundScript";
import QueryInfo = chrome.tabs.QueryInfo;

function findTabByUrl(request: HttpRequest): QueryInfo {
    const uri = Uri.of(request.uri);
    const pattern = `${uri.scheme}://${uri.authority?.host}/*`;
    return {url: pattern};
}

/**
 * Run this in a background script
 */
export function startBackgroundListener(
    tabQuery: (request: HttpRequest) => chrome.tabs.QueryInfo = findTabByUrl) {
    chrome.runtime.onMessage.addListener((message: FetchMessage | any, sender, sendResponse) => {
        if (!isFetchMessage(message))
            return;
        const request = message.request;
        // see https://developer.chrome.com/docs/extensions/mv2/match_patterns/
        chrome.tabs.query(tabQuery(request), (tabs) => {
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
