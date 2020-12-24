import {FetchHandler} from "@http4t/browser/fetch";
import {HttpHandler} from "@http4t/core/contract";
import {badGateway, ErrorAdapter} from "./ErrorAdapter";
import {handleFetchMessages} from "./FetchMessage";

/**
 * Handles requests sent by a background script which has called {@link startBackgroundListener}
 */
export function startContentScriptListener(
    http: HttpHandler = new FetchHandler(),
    onError: ErrorAdapter = badGateway) {
    handleFetchMessages(http, onError);
}
