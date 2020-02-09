import {HeaderName, HeaderValue, HttpBody, HttpMessage} from "./contract";
import * as h from "./headers";
import {header} from "./headers";
import {modify} from "./util/objects";

export function setHeader<T extends HttpMessage>(message: T, name: HeaderName, value: HeaderValue): T {
  return modify(message, {headers: h.setHeader(message.headers, header(name, value))} as Partial<T>);
}

export function setBody<T extends HttpMessage>(message: T, body: HttpBody): T {
  return modify(message, {body} as Partial<T>);
}