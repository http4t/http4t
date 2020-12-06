import {Header, HttpBody, HttpResponse} from "./contract";

export function responseOf(status: number, body?: HttpBody, ...headers: Header[]): HttpResponse {
    return {status, headers: headers, body: body ? body : ''}
}

export function ok(body?: HttpBody, ...headers: Header[]): HttpResponse {
    return responseOf(200, body, ...headers);
}

export function notFound(body?: HttpBody, ...headers: Header[]): HttpResponse {
    return responseOf(404, body, ...headers);
}