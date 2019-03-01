import {HttpRequest, ParsedUri} from "./contract";

export class Uri implements ParsedUri {
    readonly scheme?: string;
    readonly authority?: string;
    readonly path: string;
    readonly query?: string;
    readonly fragment?: string;

    constructor({scheme, authority, path, query, fragment}: ParsedUri) {
        this.scheme = scheme;
        this.authority = authority;
        this.path = path;
        this.query = query;
        this.fragment = fragment;
    }

    static RFC_3986 = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

    /** {@link https://tools.ietf.org/html/rfc3986#appendix-B } */
    static parse(uri:string) {
        const match = Uri.RFC_3986.exec(uri);
        if (!match) throw new Error(`Invalid Uri: ${uri}`);
        const [, , scheme, , authority, path, , query, , fragment] = match;
        return new Uri({scheme, authority, path, query, fragment});
    }

    static of(request: HttpRequest): Uri {
        const uri = request.uri;
        if(uri instanceof Uri) return uri;
        return typeof uri === 'string' ? Uri.parse(uri) : new Uri(uri);
    }

    /** {@link https://tools.ietf.org/html/rfc3986#section-5.3} */
    toString() {
        const result: string[] = [];

        if (typeof this.scheme != 'undefined') result.push(this.scheme, ":");
        if (typeof this.authority != 'undefined') result.push("//", this.authority);
        result.push(this.path);
        if (typeof this.query != 'undefined') result.push("?", this.query);
        if (typeof this.fragment != 'undefined') result.push("#", this.fragment);
        return result.join('');
    }

    toJSON(){
        return this.toString();
    }
}

