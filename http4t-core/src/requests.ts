import {Header, HttpBody, HttpRequest, Method, ParsedAuthority} from "./contract";
import {getHeaderValue} from "./headers";
import {
    appendQueries as uriAppendQueries,
    appendQuery as uriAppendQuery, QueryValue,
    setQueries as uriSetQueries,
    setQuery as uriSetQuery,
    removeQuery as uriRemoveQuery,
    removeQueries as uriRemoveQueries,
    query as uriQuery,
    queries as uriQueries,
} from "./queries";
import {
  Authority,
  Uri,
  UriLike
} from "./uri";
import {modify} from "./util/objects";

export function request(method: Method, uri: UriLike, body?: HttpBody, ...headers: Header[]): HttpRequest {
    return {
        method,
        uri: Uri.of(uri),
        headers: headers,
        body: body ? body : ''
    };
}

export function get(uri: UriLike, ...headers: Header[]): HttpRequest {
    return request("GET", uri, undefined, ...headers);
}

export function post(uri: UriLike, body?: HttpBody, ...headers: Header[]): HttpRequest {
    return request("POST", uri, body, ...headers);
}

export function put(uri: UriLike, body?: HttpBody, ...headers: Header[]): HttpRequest {
    return request("PUT", uri, body, ...headers);
}

export function patch(uri: UriLike, body?: HttpBody, ...headers: Header[]): HttpRequest {
    return request("PATCH", uri, body, ...headers);
}

export function delete_(uri: UriLike | string, ...headers: Header[]): HttpRequest {
    return request("DELETE", uri, undefined, ...headers);
}

export function query(message: HttpRequest, name: string): string | undefined {
    const query = message.uri.query;
    return uriQuery(query, name)
}

export function queries(message: HttpRequest, name:string): (string | undefined)[] {
    const query = message.uri.query;
    return uriQueries(query, name);
}

export function appendQueries(message: HttpRequest, queries: { [key: string]: QueryValue }): HttpRequest {
    const query = message.uri.query;
    return modify(message, {uri: modify(message.uri, {query: uriAppendQueries(query, queries)})})
}

export function appendQuery(message: HttpRequest, name: string, value: QueryValue): HttpRequest {
    const query = message.uri.query;
    return modify(message, {uri: modify(message.uri, {query: uriAppendQuery(query, name, value)})})
}

export function setQueries(message: HttpRequest, queries: { [key: string]: QueryValue }): HttpRequest {
    const query = message.uri.query;
    return modify(message, {uri: modify(message.uri, {query: uriSetQueries(query, queries)})})
}

export function setQuery(message: HttpRequest, name: string, value: string | undefined): HttpRequest {
    const query = message.uri.query;
    return modify(message, {uri: modify(message.uri, {query: uriSetQuery(query, name, value)})})
}

export function removeQuery(message: HttpRequest, name: string): HttpRequest {
    const query = message.uri.query;
    return modify(message, {uri: modify(message.uri, {query: uriRemoveQuery(query, name)})})
}

export function removeQueries(message: HttpRequest, ...names: string[]): HttpRequest {
    const query = message.uri.query;
    return modify(message, {uri: modify(message.uri, {query: uriRemoveQueries(query, ...names)})})
}

export function authority(request: HttpRequest): ParsedAuthority {
    if (typeof request.uri.authority != 'undefined')
        return request.uri.authority;

    const value = getHeaderValue(request.headers, 'Host');
    if (typeof value != 'string') throw new Error(`Could not get authority from request uri '${request.uri}'`);

    return Authority.parse(value);
}

export function uri(request: HttpRequest): Uri {
    return Uri.of(request.uri);
}

export function uriString(request: HttpRequest): string {
    return Uri.of(request.uri).toString();
}