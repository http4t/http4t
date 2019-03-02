import {Body, Header, HttpResponse} from "./contract";

export function response(status: number, headers?: Header[], body?: Body): HttpResponse {
  return {status, headers: headers || [], body: body ? body : ''}
}

export function ok(headers?: Header[], body?: Body): HttpResponse {
  return response(200, headers, body);
}

export function notFound(headers?: Header[], body?: Body): HttpResponse {
  return response(404, headers, body);
}