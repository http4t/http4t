import {ParsedUri, Uri} from "./contract";

export class Uris {
  static parsed = parsed;
}

const RFC_3986 = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

/** {@link https://tools.ietf.org/html/rfc3986#appendix-B } */
export function parse(uri:string) : ParsedUri {
  const match = RFC_3986.exec(uri);
  if (!match) throw new Error(`Invalid Uri: ${uri}`);
  const [, , scheme, , authority, path, , query, , fragment] = match;
  return {scheme,authority,path,query,fragment};
}

/** {@link https://tools.ietf.org/html/rfc3986#section-5.3} */
export function string(uri:Uri) : string {
  if(typeof uri === 'string') return uri;
  const result: string[] = [];

  if (typeof uri.scheme != 'undefined') result.push(uri.scheme, ":");
  if (typeof uri.authority != 'undefined') result.push("//", uri.authority);
  result.push(uri.path);
  if (typeof uri.query != 'undefined') result.push("?", uri.query);
  if (typeof uri.fragment != 'undefined') result.push("#", uri.fragment);
  return result.join('');
}

export function parsed(uri:Uri) : ParsedUri {
  return typeof uri === 'string' ? parse(uri):uri;
}