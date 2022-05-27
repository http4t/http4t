import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {badGateway, ErrorResponder} from "./util/ErrorResponder";
import {fetchMessage} from "./FetchMessage";

/**
 * Routes a request to another tab which is also running this extension.
 *
 * Depends on a running background script which has called {@link startBackgroundListener}
 */
export class FetchViaBackgroundScript implements HttpHandler {
    constructor(
        private readonly extensionId: (request: HttpRequest) => any =
            () => chrome.runtime.id,
        private readonly options: (request: HttpRequest) => chrome.runtime.MessageOptions =
            () => ({}),
        private readonly onError: ErrorResponder =
            badGateway) {
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        return new Promise((resolve) => {
            try {
                chrome.runtime.sendMessage(
                    this.extensionId(request),
                    fetchMessage(request),
                    this.options(request),
                    response => response
                        ? resolve(response)
                        : this.onError(request, {message: "No response from background script"})
                );

            } catch (e) {
                resolve(this.onError(request, e))
            }
        })
    }
}


