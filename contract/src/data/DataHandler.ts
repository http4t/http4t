import {Data} from "../contract";
import {isUint8Array, typeDescription} from "../util";

export interface DataHandler<T> {
  bytes(body: Uint8Array): T;

  string(body: string): T;
}

export function handleData<T>(handler: DataHandler<T>, data: Data): T {
  if (isUint8Array(data))
    return handler.bytes(data as Uint8Array);
  if (typeof data === 'string')
    return handler.string(data);

  throw new Error(`Not valid data: '${data}' (${typeDescription(data)})`)
}