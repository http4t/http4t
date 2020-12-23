import {HttpRequest} from "@http4t/core/contract";

export type FetchMessage = { msg: "fetch", request: HttpRequest };

export function fetchMessage(request: HttpRequest): FetchMessage {
    return {msg: "fetch", request}
}

export function isFetchMessage(value: any): value is FetchMessage {
    return value && value["msg"] === "fetch";
}
