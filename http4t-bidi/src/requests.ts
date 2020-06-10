import {HttpMessage, Method} from "@http4t/core/contract";
import {MessageLens, RequestLens} from "./lenses";
import {IntersectionLens} from "./lenses/IntersectionLens";
import {MethodLens} from "./lenses/MethodLens";
import {PathLens} from "./lenses/PathLens";
import {literal} from "./paths/Literal";
import {isPathMatcher, PathMatcher} from "./paths/PathMatcher";

export type PathLike<TPath = undefined> = RequestLens<TPath> | PathMatcher<TPath> | string

export function request<TPath extends object>(method: Method, path: PathLike<TPath>): RequestLens<TPath>;
export function request<TPath extends object, TBody = unknown>(
  method: Method,
  path: PathLike<TPath>,
  body: RequestLens<TBody> | MessageLens<HttpMessage, TBody>): RequestLens<TPath & TBody>;

export function request<TPath extends object, TBody extends object>(
  method: Method,
  pathLike: PathLike<TPath>,
  body?: RequestLens<TBody> | MessageLens<HttpMessage, TBody>
): RequestLens<TPath> | RequestLens<TPath & TBody> {

  const path: RequestLens<TPath> =
    typeof pathLike === 'string'
      ? new PathLens(literal(pathLike)) as any as PathLens<TPath>
      : isPathMatcher(pathLike)
      ? new PathLens(pathLike)
      : pathLike;

  const methodAndPath = new IntersectionLens(
    new MethodLens(method),
    path);

  return body
    ? new IntersectionLens(methodAndPath, body as RequestLens<TBody>)
    : methodAndPath;
}
