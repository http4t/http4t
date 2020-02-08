import {HttpBody, Header, HttpResponse} from "./contract";

export function response(status: number, body?: HttpBody, ...headers: Header[]): HttpResponse {
  return {status, headers: headers, body: body ? body : ''}
}

export function ok(body?: HttpBody, ...headers: Header[]): HttpResponse {
  return response(200, body, ...headers);
}

export function notFound(body?: HttpBody, ...headers: Header[]): HttpResponse {
  return response(404, body, ...headers);
}