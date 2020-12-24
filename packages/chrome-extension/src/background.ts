import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {uriString} from "@http4t/core/requests";
import {badGateway, ErrorResponder} from "./util/ErrorResponder";
import {fetchMessage, handleFetchMessages} from "./FetchMessage";
import {findTabByHost, TabFinder} from "./util/tabs";


export class SendToTabHandler implements HttpHandler {
    constructor(private readonly findTab: TabFinder = findTabByHost) {
    }

    handle(request: HttpRequest): Promise<HttpResponse> {
        return this.findTab(request)
            .then(tab => {
                if (!tab)
                    throw {
                        message: `Could not find tab for ${request.method} ${uriString(request)}`,
                        request
                    };

                const tabId = tab.id;
                if (!tabId)
                    throw {message: "Tab did not have an id", tab};

                return new Promise<HttpResponse>((resolve) =>
                    chrome.tabs.sendMessage(
                        tabId,
                        fetchMessage(request),
                        resolve));
            })
    }
}

/**
 * Routes requests from {@link FetchViaBackgroundScript} to the appropriate tabs
 *
 * Depends on the tabs running a content script which has called {@link startContentScriptListener}
 */
export function startBackgroundListener(
    http: HttpHandler = new SendToTabHandler(findTabByHost),
    onError: ErrorResponder = badGateway
) {
    handleFetchMessages(http, onError);
}
