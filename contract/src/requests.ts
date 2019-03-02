import {Body, Header, HttpRequest, Method, ParsedUri, UriLike} from "./";
import {Uri} from "./uri";

/**
 * UriLike is either a unparsed or parsed
 */
export type UriLike = string | ParsedUri;

export function request(method: Method, uri: UriLike, headers?: Header[], body?: Body): HttpRequest {
  return {
    method,
    uri: Uri.of(uri),
    headers: headers || [],
    body: body ? body : ''
  };
}

export function get(uri: UriLike, headers?: Header[]): HttpRequest {
  return request("GET", uri, headers);
}

export function post(uri: UriLike, headers?: Header[], body?: Body): HttpRequest {
  return request("POST", uri, headers, body);
}

export function put(uri: UriLike, headers?: Header[], body?: Body): HttpRequest {
  return request("PUT", uri, headers, body);
}

export function patch(uri: UriLike, headers?: Header[], body?: Body): HttpRequest {
  return request("PATCH", uri, headers, body);
}

export function delete_(uri: UriLike | string, headers?: Header[]): HttpRequest {
  return request("DELETE", uri, headers);
}
