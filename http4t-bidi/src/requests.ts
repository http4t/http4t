import {HttpBody, HttpMessage, Method} from "@http4t/core/contract";
import {MethodLens} from "./lenses/MethodLens";
import {RequestUriLens} from "./lenses/RequestUriLens";
import {UnionLens} from "./lenses/UnionLens";
import {UriLens} from "./lenses/UriLens";
import {literal} from "./paths/Literal";
import {isPathMatcher, PathMatcher} from "./paths/PathMatcher";
import {BiDiLens, MessageLens, RequestLens} from "./routes";
import {Result, success} from "@http4t/result";
import {header} from "@http4t/core/headers";
import {bodyJson, jsonBody} from "@http4t/core/json";
import {bufferText} from "@http4t/core/bodies";
import {JsonLens} from "./lenses/JsonLens";



export class ResponseBodyLens<T, TBody, TMessage extends HttpMessage> implements MessageLens<T, TMessage> {
  constructor(private bodyLens: BodyLens<T, TBody>) {}

  async extract(message: TMessage): Promise<Result<T>> {
    const value = await bodyJson<T>(message.body);
    return this.bodyLens.extract(value);
  }

  async inject(value: T, message: TMessage): Promise<TMessage> {
    return {
      ...message,
      headers: [...message.headers, header('Content-Type', 'application/json')],
      body: jsonBody(value)
    };
  }
}

export function json<T, TMessage extends HttpMessage=HttpMessage>(): JsonLens<T, TMessage> {
  return new JsonLens<T, TMessage>();
}

export class RequestBodyLens<TBody, TMessage extends HttpMessage> implements MessageLens<HttpBody, TMessage> {
  constructor(private bodyLens: BodyLens<HttpBody, TBody>) {}

  async extract(output: TMessage): Promise<Result<HttpBody>> {

    return success(output.body);
  }

  async inject(value: HttpBody, message: TMessage): Promise<TMessage> {
    return {
      ...message,
      body: this.body
    };
  }

}

export class BodyLens<IN, OUT> implements BiDiLens<IN, OUT> {
  constructor(private to: (input: IN, output: OUT) => OUT, private from: (t: OUT) => IN) {
  }
  async extract(output: OUT): Promise<Result<IN>> {
    return success(this.from(output));
  }

  async inject(input: IN, output: OUT): Promise<OUT> {
    return this.to(input, output);
  }

}

export function request<TPath, TBody>(method: Method, path: RequestLens<TPath> | PathMatcher<TPath>, body?: TBody): RequestLens<TPath>;
export function request<TBody>(method: Method, path: string, body?: TBody): RequestLens<{}>;
export function request<TPath, TRequestBody, TBody>(
  method: Method,
  pathOrString: RequestLens<TPath> | PathMatcher<TPath> | string,
  body?: TBody
): RequestLens<TPath> {

  const path: RequestLens<TPath> =
    typeof pathOrString === 'string'
      ? new RequestUriLens(new UriLens(literal(pathOrString))) as any as RequestUriLens<TPath>
      : isPathMatcher(pathOrString)
      ? new RequestUriLens(new UriLens<TPath>(pathOrString))
      : pathOrString;

  if (body) {
    return new UnionLens(
        new RequestBodyLens(body),
        new UnionLens(
            new MethodLens(method),
            path)
    )
  }
  return new UnionLens(
      new MethodLens(method),
      path);

}

