import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {uriString} from "@http4t/core/requests";
import {Uri} from "@http4t/core/uri";
import {badGateway, ErrorAdapter} from "./ErrorAdapter";
import {FetchMessage, fetchMessage, isFetchMessage} from "./FetchMessage";
import CreateProperties = chrome.tabs.CreateProperties;
import QueryInfo = chrome.tabs.QueryInfo;
import Tab = chrome.tabs.Tab;


export function rootUrl(request: HttpRequest): CreateProperties {
    const requestUri = Uri.of(request.uri);
    const uri = Uri.of({
        scheme: requestUri.scheme,
        authority: requestUri.authority,
        path: "/"
    });
    return {
        url: uri.toString(),
        active: false
    };
}

export function sameHost(request: HttpRequest): QueryInfo {
    const requestUri = Uri.of(request.uri);
    const uri = Uri.of({
        scheme: requestUri.scheme,
        authority: requestUri.authority,
        path: "/*"
    });
    return {url: uri.toString()};
}

export function findOrCreateTab(
    queryInfo: QueryInfo,
    properties: CreateProperties): Promise<Tab> {
    return new Promise<Tab>((resolve, reject) =>
        chrome.tabs.query(queryInfo, (tabs) => {
            console.log("tabs", tabs);
            console.log("queryInfo", queryInfo);
            const tab = tabs?.[0];
            if (tab)
                return resolve(tab);

            chrome.tabs.create(properties, (tab) => {
                if (!tab) {
                    reject({message: "Could not create tab", properties})
                } else {
                    resolve(tab);
                }
                return true;
            })
        }))
}

export const findTabByHost: TabFinder =
    request => {
        return findOrCreateTab(
            sameHost(request),
            rootUrl(request));
    }

export type TabFinder = (request: HttpRequest) => Promise<Tab>;

export class SendToTabHandler implements HttpHandler {
    constructor(private readonly findTab: TabFinder = findTabByHost) {
    }

    handle(request: HttpRequest): Promise<HttpResponse> {
        return this.findTab(request)
            .then(tab => {
                console.log("tab", tab);
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
                        response=>{
                            resolve(response);
                            return true;
                        }));
            })
    }
}

/**
 * Routes requests from {@link FetchViaBackgroundScript} to the appropriate tabs
 *
 * Depends on the tabs running a content script which has called {@link startContentPageListener}
 */
export function startBackgroundListener(
    http: HttpHandler = new SendToTabHandler(findTabByHost),
    onError: ErrorAdapter = badGateway
) {
    chrome.runtime.onMessage.addListener(async (message: FetchMessage | any, sender, sendResponse) => {
        if (!isFetchMessage(message))
            return;

        http.handle(message.request)
            .then(sendResponse)
            .catch(err => sendResponse(onError(message.request, err)));

        return true;
    });
}
