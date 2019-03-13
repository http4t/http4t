import { Header, HeaderName, HeaderValue } from './contract';
export declare function getHeaderValue(headers: Header[], name: HeaderName): HeaderValue | undefined;
export declare type HeaderValueLike = string | number | Date;
/**
 * header creates a header from a name and value
 * Dates will be formatted into the correct format as defined by [RFC 5322](https://tools.ietf.org/html/rfc5322)
 */
export declare function header(name: HeaderName, value: HeaderValueLike): Header;
