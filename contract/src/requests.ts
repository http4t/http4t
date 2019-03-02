import {Body, header, Header, HeaderName, HeaderValue, HttpRequest, Method} from "./";
import {Uri, UriLike} from "./uri";

export function request(method: Method, uri: UriLike, body?: Body, ...headers: Header[]): HttpRequest {
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

export function post(uri: UriLike, body?: Body, ...headers: Header[]): HttpRequest {
  return request("POST", uri, body, ...headers);
}

export function put(uri: UriLike, body?: Body, ...headers: Header[]): HttpRequest {
  return request("PUT", uri, body, ...headers);
}

export function patch(uri: UriLike, body?: Body, ...headers: Header[]): HttpRequest {
  return request("PATCH", uri, body, ...headers);
}

export function delete_(uri: UriLike | string, ...headers: Header[]): HttpRequest {
  return request("DELETE", uri, undefined, ...headers);
}

export function setHeader(req: HttpRequest, name: HeaderName, value: HeaderValue): HttpRequest {
  return request(req.method, req.uri, req.body, ...[...req.headers, header(name, value)]);
}