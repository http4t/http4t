import { Body, Data } from "./contract";
export declare class Buffered {
    static text: typeof bufferText;
    static binary: typeof bufferBinary;
}
export declare class Streamed {
    static text: typeof streamText;
    static binary: typeof streamBinary;
}
export declare function bufferText(body: Body): Promise<string>;
export declare function bufferBinary(body: Body): Promise<Uint8Array>;
export declare function streamText(body: Body): AsyncIterable<string>;
export declare function streamBinary(body: Body): AsyncIterable<Uint8Array>;
export declare function dataString(data: Data): string;
export declare function dataBinary(data: Data): Uint8Array;
export declare function typeDescription(x: any): string;
