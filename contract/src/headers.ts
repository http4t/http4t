import {Header, HeaderName, HeaderValue} from './contract';


// TODO: clean up this gross namespace

export function getHeaderValue(headers: Header[], name: HeaderName): HeaderValue | undefined {
  if(!headers)
    return undefined;

  const lowerCaseName = name.toLowerCase();
  for (const [n, v] of headers) {
    if (n.toLowerCase() === lowerCaseName)
      return v;
  }
  return undefined;
}

export type HeaderValueLike = string | number | Date;
/**
 * header creates a header from a name and value
 * Dates will be formatted into the correct format as defined by [RFC 5322](https://tools.ietf.org/html/rfc5322)
 */
export function header(name: HeaderName, value: HeaderValueLike): Header {
  // TODO Date formatting
  return [name, String(value)];
}
