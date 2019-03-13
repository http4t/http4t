import {Body, Header, HeaderName, HeaderValue, HttpRequest, Method} from "./contract";
import {Uri, UriLike} from "./uri";
import {getHeaderValue, header} from "./headers";

export function request(method: Method, uri: UriLike, body?: Body, ...headers: Header[]): HttpRequest {
  return {
    method,
    uri: Uri.of(uri),
    headers: headers,
    body: body ? body : ''
  };
}

export function modifyRequest(request: HttpRequest, modifications: Partial<HttpRequest>): HttpRequest {
  return Object.assign({}, request, modifications);
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
  return modifyRequest(req, {headers: [...req.headers, header(name, value)]});
}

export function host(request: HttpRequest): string {
  if (typeof request.uri.authority != 'undefined')
    return request.uri.authority;

  const value = getHeaderValue(request.headers, 'Host');
  if (typeof value != 'string') throw new Error(`Could not get authority from request uri '${request.uri}'`);
  return value;
}