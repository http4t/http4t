import {HttpMessage, Method} from "@http4t/core/contract";
import {IntersectionLens} from "./lenses/IntersectionLens";
import {MethodLens} from "./lenses/MethodLens";
import {RequestUriLens} from "./lenses/RequestUriLens";
import {literal} from "./paths/Literal";
import {isPathMatcher, PathMatcher} from "./paths/PathMatcher";
import {MessageLens, RequestLens} from "./routes";

export type PathLike<TPath = undefined> = RequestLens<TPath> | PathMatcher<TPath> | string

export function request<TPath = undefined>(method: Method, path: PathLike<TPath>): RequestLens<TPath>;
export function request<TBody, TPath = undefined>(
  method: Method,
  path: PathLike<TPath>,
  body: RequestLens<TBody> | MessageLens<HttpMessage, TBody>): RequestLens<TPath & TBody>;

export function request<TPath, TBody>(
  method: Method,
  pathLike: PathLike<TPath>,
  body?: RequestLens<TBody> | MessageLens<HttpMessage, TBody>
): RequestLens<TPath> {

  const path: RequestLens<TPath> =
    typeof pathLike === 'string'
      ? new RequestUriLens(literal(pathLike)) as any as RequestUriLens<TPath>
      : isPathMatcher(pathLike)
      ? new RequestUriLens(pathLike)
      : pathLike;

  const methodAndPath = new IntersectionLens(
    new MethodLens(method),
    path);
  return body
    ? new IntersectionLens(methodAndPath, body as RequestLens<TBody>)
    : methodAndPath;
}
