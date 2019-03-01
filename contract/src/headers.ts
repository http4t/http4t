import {Header, HeaderName, HeaderValue} from "./contract";
import {const_} from "./util";

export function header(name: HeaderName, value: HeaderValue): Header {
  return [name, value];
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

header('Content-Type', request)
request = header(request, 'Content-Type', 'newValue')