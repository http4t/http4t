import {Header, HeaderName, HeaderValue} from './contract';

/** Case insensitive on name */
export function getHeaderValue(headers: readonly Header[], name: HeaderName): HeaderValue | undefined {
  if (!headers)
    return undefined;

  const lowerCaseName = name.toLowerCase();
  for (const [n, v] of headers) {
    if (n.toLowerCase() === lowerCaseName)
      return v;
  }
  return undefined;
}

/**
 * Replaces header(s) with same name in headers.
 *
 * Case insensitive on header name
 */
export function setHeader(headers: undefined | readonly Header[], header: Header): readonly Header[] {
  if (!headers)
    return [header];

  const lowerCaseName = headerName(header).toLowerCase();
  return [...headers.filter(([name]) => name.toLowerCase() !== lowerCaseName), header];
}

export type HeaderValueLike = string | number | Date;

/**
 * Dates will be formatted into the correct format as defined by [RFC 5322](https://tools.ietf.org/html/rfc5322)
 */
export function header(name: HeaderName, value: HeaderValueLike): Header {
  // TODO Date formatting
  return [name, String(value)];
}

export function headerName(header: Header): HeaderName {
  return header[0];
}

export function headerValue(header: Header): HeaderValue {
  return header[1];
}
