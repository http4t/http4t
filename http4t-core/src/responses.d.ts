import { Body, Header, HttpResponse } from "./contract";
export declare function response(status: number, body?: Body, ...headers: Header[]): HttpResponse;
export declare function ok(body?: Body, ...headers: Header[]): HttpResponse;
export declare function notFound(body?: Body, ...headers: Header[]): HttpResponse;
