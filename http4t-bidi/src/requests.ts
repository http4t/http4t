import {Method} from "@http4t/core/contract";
import {MethodLens} from "./lenses/MethodLens";
import {RequestUriLens} from "./lenses/RequestUriLens";
import {UnionLens} from "./lenses/UnionLens";
import {UriLens} from "./lenses/UriLens";
import {literal} from "./paths/Literal";
import {isPathMatcher, PathMatcher} from "./paths/PathMatcher";
import {RequestLens} from "./routes";

export function request<TPath>(method: Method, path: RequestLens<TPath> | PathMatcher<TPath>): RequestLens<TPath>;
export function request(method: Method, path: string): RequestLens<{}>;
export function request<TPath>(
  method: Method,
  pathOrString: RequestLens<TPath> | PathMatcher<TPath> | string
): RequestLens<TPath> {

  const path: RequestLens<TPath> =
    typeof pathOrString === 'string'
      ? new RequestUriLens(new UriLens(literal(pathOrString))) as any as RequestUriLens<TPath>
      : isPathMatcher(pathOrString)
      ? new RequestUriLens(new UriLens<TPath>(pathOrString))
      : pathOrString;

  return new UnionLens(
    new MethodLens(method),
    path);
}
