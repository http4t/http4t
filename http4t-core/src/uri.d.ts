import { ParsedUri } from "./contract";
/**
 * UriLike is either a unparsed or parsed
 */
export declare type UriLike = string | ParsedUri;
export declare class Uri implements ParsedUri {
    readonly scheme?: string;
    readonly authority?: string;
    readonly path: string;
    readonly query?: string;
    readonly fragment?: string;
    constructor({ scheme, authority, path, query, fragment }: ParsedUri);
    static RFC_3986: RegExp;
    /** {@link https://tools.ietf.org/html/rfc3986#appendix-B } */
    static parse(uri: string): Uri;
    static of(uri: UriLike): Uri;
    /** {@link https://tools.ietf.org/html/rfc3986#section-5.3} */
    toString(): string;
    toJSON(): string;
    static modify(uri: ParsedUri, modifications: Partial<ParsedUri>): Uri;
}
