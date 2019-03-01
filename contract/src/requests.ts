import {Body, Header, HttpRequest, Method, UriLike} from "./";

export function request(method: Method, uri: UriLike, headers?: Header[], body?: Body): HttpRequest {
  return {
    method,
    uri: uri,
    headers: headers || [],
    ...body ? {body} : {}
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
