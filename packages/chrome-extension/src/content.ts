import {FetchHandler} from "@http4t/browser/fetch";
import {HttpHandler} from "@http4t/core/contract";
import {badGateway, ErrorResponder} from "./util/ErrorResponder";
import {handleFetchMessages} from "./FetchMessage";

/**
 * Handles requests sent by a background script which has called {@link startBackgroundListener}
 */
export function startContentScriptListener(
    http: HttpHandler = new FetchHandler(),
    onError: ErrorResponder = badGateway) {
    handleFetchMessages(http, onError);
}
