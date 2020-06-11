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
    return headers.filter(([name, value]) => name.toLowerCase() === lowerCaseName)
            .map(([name, value]) => value)
}

/**
 * Replaces header(s) with same name in headers.
 *
 * Case insensitive on header name
 */
export function setHeader(headers: readonly Header[], header: Header): readonly Header[] {
    const lowerCaseName = headerName(header).toLowerCase();
    return [...headers.filter(([name]) => name.toLowerCase() !== lowerCaseName), header];
}

export function updateHeaders(headers: readonly Header[], name: HeaderName, f: (value: HeaderValue)=> HeaderValue): readonly Header[] {
    const lowerCaseName = name.toLowerCase();
    return headers.map(([name, value]) =>  (name.toLowerCase() === lowerCaseName) ? [name, f(value)] : [name, value] );
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
