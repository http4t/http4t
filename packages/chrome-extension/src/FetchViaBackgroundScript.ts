import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {badGateway, ErrorAdapter} from "./ErrorAdapter";
import {fetchMessage} from "./FetchMessage";
import MessageOptions = chrome.runtime.MessageOptions;

/**
 * Routes a request to another tab which is also running this extension.
 *
 * Depends on a running background script which has called {@link startBackgroundListener}
 */
export class FetchViaBackgroundScript implements HttpHandler {
    constructor(
        private readonly extensionId: (request: HttpRequest) => any =
            () => undefined as any,
        private readonly options: (request: HttpRequest) => MessageOptions =
            () => ({}),
        private readonly onError: ErrorAdapter =
            badGateway) {
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(
                this.extensionId(request),
                fetchMessage(request),
                this.options(request),
                response => response
                    ? resolve(response)
                    : this.onError(request, {message: "No response from background script"})
            );
        })
    }
}


