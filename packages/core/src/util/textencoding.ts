export function textDecoder(): { decode(input?: BufferSource, options?: TextDecodeOptions): string; } {
    if (typeof TextDecoder === 'function')
        return new TextDecoder('utf-8');
    const util = require('util');
    return new util.TextDecoder('utf-8')
}

export function textEncoder(): { encode(input?: string): Uint8Array; } {
    if (typeof TextEncoder === 'function')
        return new TextEncoder();
    const util = require('util');
    return new util.TextEncoder()
}
