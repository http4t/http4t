import {Header, HeaderName, HeaderValue} from './contract';

/**
 * Case insensitive on name
 */
export function getHeaderValue(headers: readonly Header[], name: HeaderName): HeaderValue | undefined {
    if (typeof headers === 'undefined') return undefined;

    const lowerCaseName = name.toLowerCase();
    for (const [n, v] of headers) {
        if (n.toLowerCase() === lowerCaseName)
            return v;
    }
    return undefined;
}

/**
 * Case insensitive on name
 */
export function getHeaderValues(headers: readonly Header[], name: HeaderName): HeaderValue[] {
    if (typeof headers === 'undefined') return [];

    const lowerCaseName = name.toLowerCase();
    return headers
        .filter(([name, _]) => name.toLowerCase() === lowerCaseName)
        .map(([_, value]) => value)
}

export function appendHeader(headers: readonly Header[], name: HeaderName, value: HeaderValueLike): readonly Header[] ;
export function appendHeader(headers: readonly Header[], header: Header): readonly Header[] ;
export function appendHeader(headers: readonly Header[], headerOrName: Header | HeaderName, maybeValue?: HeaderValueLike): readonly Header[] {
    if (isHeader(headerOrName))
        return [...headers, headerOrName];
    else
        return [...headers, header(headerOrName, maybeValue as HeaderValueLike)];
}

/**
 * Replaces header(s) with same name in headers.
 *
 * Case insensitive on header name when replacing
 */
export function setHeader(headers: readonly Header[], name: HeaderName, value: HeaderValueLike): readonly Header[] ;
export function setHeader(headers: readonly Header[], header: Header): readonly Header[] ;
export function setHeader(headers: readonly Header[], headerOrName: Header | HeaderName, maybeValue?: HeaderValueLike): readonly Header[] {
    const lowerCaseHeaderName: string = isHeader(headerOrName)
        ? headerName(headerOrName).toLowerCase()
        : headerOrName.toLowerCase();

    const newHeader = isHeader(headerOrName)
        ? headerOrName
        : header(headerOrName, maybeValue as HeaderValueLike);

    return [...headers.filter(([name]) => name.toLowerCase() !== lowerCaseHeaderName), newHeader];
}

export function updateHeaders(headers: readonly Header[], name: HeaderName, f: (value: HeaderValue) => HeaderValue): readonly Header[] {
    const lowerCaseName = name.toLowerCase();
    return headers.map(([name, value]) => (name.toLowerCase() === lowerCaseName) ? [name, f(value)] : [name, value]);
}

export function removeHeader(headers: readonly Header[], name: HeaderName): readonly Header[] {
    const lowerCaseName = name.toLowerCase();
    return headers.filter(([name]) => name.toLowerCase() !== lowerCaseName);
}

export type HeaderValueLike = string | number | Date;

/**
 * Dates will be formatted into the correct format as defined by [RFC 5322](https://tools.ietf.org/html/rfc5322)
 */
export function header(name: HeaderName, value: HeaderValueLike): Header {
    if (typeof value === 'object') return [name, value.toUTCString()]
    return [name, String(value)];
}

export function headerName(header: Header): HeaderName {
    return header[0];
}

export function headerValue(header: Header): HeaderValue {
    return header[1];
}

export function isHeaderName(obj: any): obj is HeaderName {
    return typeof obj === 'string';
}

export function isHeaderValue(obj: any): obj is HeaderValue {
    return typeof obj === 'string';
}

export function isHeader(obj: any): obj is Header {
    return Array.isArray(obj) && obj.length === 2 && isHeaderName(obj[0]) && isHeaderValue(obj[1]);
}