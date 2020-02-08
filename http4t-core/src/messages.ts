import {HeaderName, HeaderValue, HttpMessage} from "./contract";
import * as h from "./headers";
import {header} from "./headers";
import {modify} from "./util/objects";

export function setHeader<T extends HttpMessage>(req: T, name: HeaderName, value: HeaderValue): T {
  return modify(req, {headers: h.setHeader(req.headers, header(name, value))} as Partial<T>);
}