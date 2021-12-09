import {RequestLifecycle} from "../router";
import {Header, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {appendHeaders, bufferedText, bufferText} from "@http4t/core/messages";
import * as lenses from "../lenses";
import {WrongRoute} from "../lenses";
import {Route} from "../routes";
import {getHeaderValue, uriString} from "@http4t/core/requests";
import {v4 as uuid} from "uuid";
import {responseOf} from "@http4t/core/responses";
import {jsonBody} from "@http4t/core/json";
import {pathToString} from "@http4t/result/JsonPathResult";

const RESET = "\u001B[0m"
const BLACK = "\u001B[30m"
const RED = "\u001B[31m"
const GREEN = "\u001B[32m"
const YELLOW = "\u001B[33m"
const BLUE = "\u001B[34m"
const PURPLE = "\u001B[35m"
const CYAN = "\u001B[36m"
const RED_BACKGROUND = "\u001B[41m"

function colour(colour: string, text: string | undefined): string {
    return text ? `${colour}${text}${RESET}` : "";
}

function marker(colour: string, title: string, char: string = "-"): string {
    return `${colour}${char.repeat(100 - title.length)} ${title} ${char}${char}${RESET}`;
}

function printHeaders(headers: readonly Header[]): string {
    return headers.map(([n, v]) => `${colour(CYAN, n)}: ${colour(BLUE, v)}`).join("\r\n")
}

async function printRequest(request: HttpRequest): Promise<string[]> {
    return [
        `${colour(PURPLE, request.method)} ${colour(BLUE, uriString(request))} ${colour(CYAN, request.httpVersion)}`,
        printHeaders(request.headers),
        colour(PURPLE, await bufferedText(request))];
}

function statusColour(status: number) {
    if (status >= 200 && status <= 299)
        return GREEN;
    if (status >= 300 && status <= 399)
        return YELLOW;
    if (status >= 400 && status <= 499)
        return RED;
    if (status >= 500 && status <= 599)
        return RED_BACKGROUND + BLACK;
    return CYAN;
}

async function printResponse(response: HttpResponse): Promise<string[]> {
    return [
        `${colour(CYAN, response.httpVersion)} ${colour(statusColour(response.status), response.status.toString())}`,
        printHeaders(response.headers),
        colour(PURPLE, await bufferedText(response))];
}

type RequestMismatch = {
    routeKey: string
    route: Route<unknown, unknown>
    reason: WrongRoute
}

function printUnmatchedRoutes(markerColour: string, mismatches: RequestMismatch[]): string[] {
    if (mismatches.length === 0) return [];
    return [
        marker(markerColour, "unmatched"),
        ...mismatches.flatMap(mismatch => `${colour(YELLOW, mismatch.routeKey)}\r\n${mismatch.reason.problems.map(p => `   ${colour(CYAN, pathToString(p.path))}: ${colour(BLUE, p.message.replace("\n", "\n   "))}`).join("\r\n")}`)
    ];
}

const DEBUG_ID_HEADER = 'DebugRequestLifecycle-Id';

export class DebugRequestLifecycle implements RequestLifecycle {
    private readonly requestMismatches: { [id: string]: RequestMismatch[] } = {};

    async begin(request: HttpRequest): Promise<HttpRequest> {
        const id = uuid();
        this.requestMismatches[id] = [];
        return await bufferText(appendHeaders(request,
            [DEBUG_ID_HEADER, id],
            ['DebugRequestLifecycle-Start', new Date().getTime().toString()]));
    }

    async mismatch(request: HttpRequest, routeKey: string, route: Route<unknown, unknown>, reason: WrongRoute): Promise<void> {
        this.requestMismatches[getHeaderValue(request, DEBUG_ID_HEADER)!].push({
            routeKey,
            route,
            reason
        });
    }

    private consumeUnmatched(request: HttpRequest): RequestMismatch[] {
        const requestId = getHeaderValue(request, DEBUG_ID_HEADER)!;
        const mismatches = this.requestMismatches[requestId] || [];
        delete this.requestMismatches[requestId];
        return mismatches;
    }

    async match(request: HttpRequest, routeKey: string, route: Route<unknown, unknown>, response: HttpResponse): Promise<HttpResponse> {
        console.log([
            "",
            marker(GREEN, "request", "="),
            ...(await printRequest(request)),
            marker(GREEN, "result"),
            colour(CYAN, `Successfully matched route :${routeKey}`),
            marker(GREEN, "response"),
            ...(await printResponse(response)),
            ...printUnmatchedRoutes(GREEN, this.consumeUnmatched(request))
        ].join("\r\n"));
        return response;
    }

    async clientError(request: HttpRequest, routeKey: string, route: Route<unknown, unknown>, reason: lenses.RouteFailed): Promise<HttpResponse> {
        const mismatches = this.consumeUnmatched(request);
        console.log([
            "",
            marker(YELLOW, "request", "="),
            ...(await printRequest(request)),
            marker(YELLOW, "result"),
            colour(CYAN, `Request could not be handled by matched route "${routeKey}"`),
            marker(YELLOW, "response"),
            ...(await printResponse(reason.response)),
            ...printUnmatchedRoutes(YELLOW, mismatches)
        ].join("\r\n"));
        return reason.response;
    }

    async serverError(request: HttpRequest, routeKey: string, route: Route<unknown, unknown>, error: any): Promise<HttpResponse> {
        const mismatches = this.consumeUnmatched(request);
        const errorString = error.stack || error.toString();
        const response = responseOf(500, errorString)
        console.error([
            "",
            marker(RED, "request", "="),
            ...(await printRequest(request)),
            marker(RED, "result"),
            colour(CYAN, `SERVER ERROR ${routeKey}`),
            colour(RED, errorString),
            marker(RED, "response"),
            ...(await printResponse(response)),
            ...printUnmatchedRoutes(RED, mismatches)
        ].join("\r\n"));
        return response;
    }

    async noMatchFound(request: HttpRequest): Promise<HttpResponse> {
        const mismatches = this.consumeUnmatched(request);
        const response = responseOf(404, jsonBody({mismatches}))
        console.log([
            "",
            marker(YELLOW, "request", "="),
            ...(await printRequest(request)),
            marker(YELLOW, "result"),
            colour(CYAN, `Request could not be handled by any of ${mismatches.length} routes`),
            marker(YELLOW, "response"),
            ...(await printResponse(response)),
            ...printUnmatchedRoutes(YELLOW, mismatches)
        ].join("\r\n"));
        return response;
    }

}

const DEBUG: RequestLifecycle = new DebugRequestLifecycle();

export function debug(): RequestLifecycle {
    return DEBUG;
}