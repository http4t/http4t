/**
 * The HTTP contract defines the simplest representation of the actual wire format of HTTP.
 * The API must support both client and server implementation/usage so is a uniform interface
 */


/**
 * The standard HTTP method type as defined by [RFC 7230](https://tools.ietf.org/html/rfc7230) or an extension
 */
export type Method =
    'GET'
    | 'POST'
    | 'PUT'
    | 'PATCH'
    | 'DELETE'
    | 'HEAD'
    | 'OPTIONS'
    | 'TRACE'
    | 'CONNECT'
    | 'UPGRADE'
    | string;

/**
 * Header is a name value pair
 */
export type Header = [HeaderName, HeaderValue];

/**
 * The standard HTTP header name as defined by [RFC 7230](https://tools.ietf.org/html/rfc7230) or an extension
 */
export type HeaderName =
    'Accept'
    | 'Accept-Charset'
    | 'Accept-Encoding'
    | 'Accept-Language'
    | 'Authorization'
    | 'Cache-Control'
    | 'Content-Encoding'
    | 'Content-Language'
    | 'Content-Length'
    | 'Content-Location'
    | 'Content-Type'
    | 'Content-MD5'
    | 'Date'
    | 'ETag'
    | 'Expires'
    | 'Host'
    | 'If-Match'
    | 'If-Modified-Since'
    | 'If-None-Match'
    | 'If-Unmodified-Since'
    | 'Last-Modified'
    | 'Location'
    | 'User-Agent'
    | 'Vary'
    | 'WWW-Authenticate'
    | 'Cookie'
    | 'Set-Cookie'
    | 'X-Forwarded-For'
    | 'X-Forwarded-Proto'
    | 'X-Forwarded-Host'
    | 'X-Frame-Options'
    | 'X-CorrelationID'
    | 'Transfer-Encoding'
    | 'Access-Control-Allow-Origin'
    | string ;

/**
 * Header value is either a string or a Date.
 * Dates will be formatted into the correct format as defined by [RFC 5322](https://tools.ietf.org/html/rfc5322)
 */
export type HeaderValue = string | Date;

/**
 * Data can either be binary or text
 */
export type Data = string | ArrayBuffer;

/**
 * Body can either be synchronous or asynchronous and of fixed or unknown length.
 */
export type Body = Data | Iterator<Data> | Promise<Data> | AsyncIterator<Data>;

/**
 * Parsed URI as specified by [RFC 3986](https://tools.ietf.org/html/rfc3986)
 */
export interface ParsedUri {
    readonly scheme?: string;
    readonly authority?: string;
    readonly path: string;
    readonly query?: string;
    readonly fragment?: string;
}

/**
 * Uri is either parsed or unparsed
 */
export type Uri = string | ParsedUri;

/**
 * MessageFormat contain headers followed by an optional body
 */
export interface MessageFormat {
    readonly headers: Header[],
    readonly body?: Body
}

/**
 * Request is made up of a method, uri and optional version followed by the headers and optional body
 */
export interface Request extends MessageFormat {
    readonly method: Method
    readonly uri: Uri,
    /**
     * Version is not available in all implementations so is optional
     */
    readonly version?: string,
}

/**
 * Response is made up of an optional version, status (code) and optional description followed by the headers and optional body
 */
export interface Response extends MessageFormat {
    /**
     * Version is not available in all implementations so is optional
     */
    readonly version?: string,
    readonly status: number,
    /**
     * Description is not available in all implementations so is optional
     */
    readonly statusDescription?: string,
}

/**
 * Message can either be a Request or Response
 */
export type Message = Request | Response;

/**
 * Handler takes a request and returns a Response.
 * Used by clients and servers
 */
export interface Handler {
    handle(request: Request): Promise<Response>;
}

