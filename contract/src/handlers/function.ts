import {HandlerFunction, HttpHandler} from "../contract";

export function handler(handle: HandlerFunction): HttpHandler {
  return {handle}
}
