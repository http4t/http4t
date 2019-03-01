import {Body, Data} from "./contract";
import {isAsyncIterable, isData, isIterable, isPromiseLike, toPromiseArray, typeDescription} from "./util";
import {TextDecoder} from "util";

export class Buffered {
    static text = bufferText;
    static binary = bufferBinary;
}

export class Streaming {
    static text = streamText;
    static binary = streamBinary;
}

export async function bufferText(body: Body | undefined): Promise<string> {
    if (!body) return "";
    if (isPromiseLike(body)) {
        return string(await body);
    }
    if (isAsyncIterable(body)) {
        return (await toPromiseArray(body)).map(string).join("");
    }
    if (isData(body)) {
        return string(body);
    }
    if (isIterable(body)) {
        let from = Array.from(body);
        return from.map(string).join("")
    }
    throw new Error(`Not a valid body: '${body}' (${typeDescription(body)})`)
}

export async function bufferBinary(body: Body | undefined): Promise<Uint8Array> {
  throw new Error("Not implemented");
}

export function streamText(body: Body | undefined): AsyncIterable<string> {
  throw new Error("Not implemented");
}

export function streamBinary(body: Body | undefined): AsyncIterable<Uint8Array> {
  throw new Error("Not implemented");
}

export function string(data: Data) {
    if (typeof data === 'string') return data;
    if (data instanceof Uint8Array) return new TextDecoder("utf-8").decode(data);
    throw new Error(`Not supported ${typeDescription(data)}`)
}

