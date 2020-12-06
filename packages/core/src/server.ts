import {ParsedUri} from "./contract";

export interface Closeable<T = unknown> {
    close(): Promise<T>
}

export interface Server extends Closeable {
    url(): Promise<ParsedUri>
}
