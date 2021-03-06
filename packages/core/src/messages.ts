import {Header, HeaderName, HeaderValue, HttpBody, HttpMessage, HttpRequest, HttpResponse} from "./contract";
import * as h from "./headers";
import {HeaderValueLike, isHeader, isHeaderValue} from "./headers";
import {modify} from "./util/objects";
import {bufferText} from "./bodies";

/*
* these operate on headers in a case-insensitive way
* while headers themselves can have any casing they like and we preserve it.
* */
export function setHeader<T extends HttpMessage>(message: T, name: HeaderName, value: HeaderValueLike): T ;
export function setHeader<T extends HttpMessage>(message: T, header: Header): T ;
export function setHeader<T extends HttpMessage>(message: T, headerOrName: Header | HeaderName, maybeValue?: HeaderValueLike): T {
    if (isHeader(headerOrName))
        return modify(message, {headers: h.setHeader(message.headers, headerOrName)} as Partial<T>);
    else if (isHeaderValue(maybeValue))
        return modify(message, {headers: h.setHeader(message.headers, headerOrName, maybeValue)} as Partial<T>);
    else
        throw new Error(`Not a valid header value: ${maybeValue}`);
}

export function appendHeader<T extends HttpMessage>(message: T, name: HeaderName, value: HeaderValueLike): T ;
export function appendHeader<T extends HttpMessage>(message: T, header: Header): T ;
export function appendHeader<T extends HttpMessage>(message: T, headerOrName: Header | HeaderName, maybeValue?: HeaderValueLike): T {
    if (isHeader(headerOrName))
        return modify(message, {headers: h.appendHeader(message.headers, headerOrName)} as Partial<T>);
    else
        return modify(message, {headers: h.appendHeader(message.headers, headerOrName, maybeValue as HeaderValueLike)} as Partial<T>);
}


export function removeHeaders<T extends HttpMessage>(message: T, name: HeaderName): T {
    return modify(message, {headers: h.removeHeader(message.headers, name)} as Partial<T>);
}

export function updateHeaders<T extends HttpMessage>(message: T, name: HeaderName, f: (value: HeaderValue) => HeaderValue): T {
    return modify(message, {headers: h.updateHeaders(message.headers, name, f)} as Partial<T>);
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