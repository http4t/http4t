import {Header, HttpBody, HttpRequest, Method, ParsedAuthority} from "./contract";
import {getHeaderValue} from "./headers";
import {Authority, Uri, UriLike} from "./uri";

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
  return typeof request.uri === 'string'
    ? request.uri
    : Uri.of(request.uri).toString();
}