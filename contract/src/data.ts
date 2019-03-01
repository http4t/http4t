import {TextDecoder} from "util";
import {Data} from "./contract";
import {identity, isUint8Array, typeDescription} from "./util";

export interface DataHandler<T> {
  bytes(body: Uint8Array): T;

  string(body: string): T;
}

export const asString: DataHandler<string> = {
  bytes: (d) => new TextDecoder("utf-8").decode(d),
  string: identity(),
};

export function handleData<T>(handler: DataHandler<T>, data: Data): T {
  if (isUint8Array(data))
    return handler.bytes(data as Uint8Array);
  if (typeof data === 'string')
    return handler.string(data);

  throw new Error(`Not valid data: '${data}' (${typeDescription(data)})`)
}

export class BodyData {
  static asString(data: Data): string {
    return handleData(asString, data);
  }
}