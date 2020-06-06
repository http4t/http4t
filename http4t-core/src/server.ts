import {HttpHandler, ParsedUri} from "./contract";

export interface Closeable<T = unknown> {
  close(): Promise<T>
}

export interface Server extends HttpHandler, Closeable {
  url(): Promise<ParsedUri>
}
