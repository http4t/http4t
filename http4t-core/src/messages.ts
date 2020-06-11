import {HeaderName, HeaderValue, HttpBody, HttpMessage, HttpRequest, HttpResponse} from "./contract";
import * as h from "./headers";
import {header} from "./headers";
import {modify} from "./util/objects";
import {bufferText} from "./bodies";

export function setHeader<T extends HttpMessage>(message: T, name: HeaderName, value: HeaderValue): T {
  return modify(message, {headers: h.setHeader(message.headers, header(name, value))} as Partial<T>);
}

export function setBody<T extends HttpMessage>(message: T, body: HttpBody): T {
  return modify(message, {body} as Partial<T>);
}

export function isResponse(message: HttpMessage): message is HttpResponse {
    return message.hasOwnProperty("status");
}

export function isRequest(message: HttpMessage): message is HttpRequest {
    return message.hasOwnProperty("method");
}

/* turns streaming bodies into text bodies so that messages are directly json serialisable  */
export async function toJSON<T extends HttpMessage>(message: T): Promise<T> {
    return {...message, body: await bufferText(message.body)}
}