import {HttpHandler, ParsedUri} from "./contract";

export interface Closeable<T> {
  close(): Promise<T>
}

export interface Server extends HttpHandler, Closeable<void>{
  url(): Promise<ParsedUri>
}
