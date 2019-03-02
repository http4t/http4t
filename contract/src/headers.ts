import {Header, HeaderName, HeaderValue} from "./contract";
import {const_} from "./util";

export type HeaderValueLike = string | number | Date;

/**
 * header creates a header from a name and value
 * Dates will be formatted into the correct format as defined by [RFC 5322](https://tools.ietf.org/html/rfc5322)
 */
export function header(name: HeaderName, value: HeaderValueLike): Header {
  // TODO Date formatting
  return [name, String(value)];
}

// TODO: do functions and class
export class Headers {
  static get(headers:Header[], name: HeaderName): HeaderValue | undefined {
    for (const [n,v] of headers) {
      if(n===name)
        return v;
    }
    return undefined;
  }

  // TODO: Could these be generic
  static replace(name: HeaderName, value: HeaderValue): (m: Header[]) => Header[] {
    return this.modify(name, const_(header(name, value)))
  }

  static modify(name: HeaderName, fn: (h: Header) => Header): (m: Header[]) => Header[] {
    return (headers: Header[]): Header[] =>
      headers.map((h: Header) => (h[0] === name ? fn(h) : h))
  }
}

