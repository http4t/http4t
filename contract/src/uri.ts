import { ParsedAuthority, ParsedUri, ParsedUserInfo } from "./contract";

/**
 * UriLike is either a unparsed or parsed
 */
export type UriLike = string | ParsedUri;

export class Uri implements ParsedUri {
  readonly scheme?: string;
  readonly authority?: ParsedAuthority;
  readonly path: string;
  readonly query?: string;
  readonly fragment?: string;

  constructor({ scheme, authority, path, query, fragment }: ParsedUri) {
    this.scheme = scheme;
    this.authority = authority;
    this.path = path;
    this.query = query;
    this.fragment = fragment;
  }

  static RFC_3986 = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

  /** {@link https://tools.ietf.org/html/rfc3986#appendix-B } */
  static parse(uri: string) {
    const match = Uri.RFC_3986.exec(uri);
    if (!match) throw new Error(`Invalid Uri: ${uri}`);
    const [, , scheme, , authority, path, , query, , fragment] = match;
    const parsedAuthority = typeof authority != 'undefined' ? Authority.from(authority) : undefined;
    return new Uri({ scheme, authority: parsedAuthority, path, query, fragment });
  }

  static of(uri: UriLike): Uri {
    if (uri instanceof Uri) return uri;
    return typeof uri === 'string' ? Uri.parse(uri) : new Uri(uri);
  }

  /** {@link https://tools.ietf.org/html/rfc3986#section-5.3} */
  toString() {
    const result: string[] = [];
    if (typeof this.scheme != 'undefined') result.push(this.scheme, ":");
    if (typeof this.authority != 'undefined' && typeof this.authority.host != 'undefined') result.push("//", this.authority.toString());
    result.push(this.path);
    if (typeof this.query != 'undefined') result.push("?", this.query);
    if (typeof this.fragment != 'undefined') result.push("#", this.fragment);
    return result.join('');
  }

  toJSON() {
    return this.toString();
  }

  static modify(uri: ParsedUri, modifications: Partial<ParsedUri>): Uri {
    return new Uri(Object.assign({}, uri, modifications))
  }
}

export class Authority implements ParsedAuthority {
  readonly host?: string;
  readonly port?: string;
  readonly userInfo?: ParsedUserInfo;
  private readonly AUTHORITY = regex("(?:([^:]+)(?:\:([^@]*)@))?([^:]+)(?:\:(\\d+))?");

  constructor(authority?: string) {
    const match = this.AUTHORITY.match(authority || '') || [];
    const [_, username, password = '', host = '', port] = match;
    this.userInfo = username ? { username, password } : undefined;
    this.host = host;
    this.port = port;
  }

  static from(authority?: string) {
    return new Authority(authority);
  }

  toString() {
    const result: string[] = [];

    if (this.userInfo) {
      if (typeof this.userInfo.username != 'undefined') result.push(this.userInfo.username, ":");
      if (typeof this.userInfo.password != 'undefined') result.push(this.userInfo.password);
      if (this.host != undefined) result.push('@');
    }
    if (this.host != undefined) result.push(this.host);
    if (this.port != undefined) result.push(':', this.port);

    return result.join('');
  }
}

export function authority(authority: string): Authority {
  return new Authority(authority);
}

function regex(pattern: string): Regex {
  return new Regex(pattern);
}

class Regex {
  private matched: RegExpExecArray | null;

  constructor(private pattern: string) {
    this.matched = null;
  }

  [Symbol.iterator]() {
    return this.matches('foo')[Symbol.iterator]()
  }

  match(against: string) {
    return new RegExp(this.pattern).exec(against)
  }

  * matches(against: string): Iterable<RegExpExecArray | null> {
    const regex = new RegExp(this.pattern, 'g');
    while (this.matched = regex.exec(against)) {
      yield this.matched;
    }
  }
}
