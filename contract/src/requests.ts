import {Body, Header, HttpRequest, Method, Uri} from "./";

export function request(method: Method, uri: Uri, headers?: Header[], body?: Body): HttpRequest {
  return {
    method,
    uri: uri,
    headers: headers || [],
    // TODO: is this needed?
    ...body ? {body} : {}
  };
}

export function get(uri: Uri, headers?: Header[]): HttpRequest {
  return request("GET", uri, headers);
}

export function post(uri: Uri, headers?: Header[], body?: Body): HttpRequest {
  return request("POST", uri, headers, body);
}

export function put(uri: Uri, headers?: Header[], body?: Body): HttpRequest {
  return request("PUT", uri, headers, body);
}

export function patch(uri: Uri, headers?: Header[], body?: Body): HttpRequest {
  return request("PATCH", uri, headers, body);
}

export function delete_(uri: Uri | string, headers?: Header[]): HttpRequest {
  return request("DELETE", uri, headers);
}
