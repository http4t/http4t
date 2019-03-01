import {Body, Data} from "../contract";
import {isAsyncIterable, isData, isIterable, isPromiseLike, toPromiseArray, typeDescription} from "../util";

export class Buffered {
    static text = text;
    static binary = binary;
}

export class Streaming {
    static text = streamingText;
    static binary = streamingBinary;
}

export async function text(body: Body | undefined): Promise<string> {
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

export async function binary(body: Body | undefined): Promise<Uint8Array> {

}

export async function streamingText(body: Body | undefined): Promise<string> {

}

export async function streamingBinary(body: Body | undefined): Promise<Uint8Array> {

}



export function string(data: Data) {
    if (typeof data === 'string') return data;
    if (data instanceof Uint8Array) return new TextDecoder("utf-8").decode(data);
    throw new Error(`Not supported ${typeDescription(data)}`)
}

