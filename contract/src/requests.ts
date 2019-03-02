import {Body, Header, HttpRequest, Method, ParsedUri, UriLike} from "./";
import {Uri} from "./uri";

/**
 * UriLike is either a unparsed or parsed
 */
export type UriLike = string | ParsedUri;

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
