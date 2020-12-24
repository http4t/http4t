import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";

export type FetchMessage = { msg: "fetch", request: HttpRequest };

export function fetchMessage(request: HttpRequest): FetchMessage {
    return {msg: "fetch", request}
}

export function isFetchMessage(value: any): value is FetchMessage {
    return value && value["msg"] === "fetch";
}

export function handleFetchMessages(http: HttpHandler, onError: (request: HttpRequest, err: any) => Promise<HttpResponse & { err: any }>) {
    chrome.runtime.onMessage.addListener(
        (message: FetchMessage | any, sender, sendResponse) : boolean => {
            if (!isFetchMessage(message)) {
                return false;
            }

            http.handle(message.request)
                .then(sendResponse)
                .catch(err => sendResponse(onError(message.request, err)))
                .catch(console.error);

            return true;
        });
}
