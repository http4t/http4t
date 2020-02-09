import {Method} from "@http4t/core/contract";
import {MethodLens} from "./lenses/MethodLens";
import {UnionLens} from "./lenses/UnionLens";
import {literal} from "./paths/Literal";
import {RequestLens} from "./routes";

export function $request<TPath>(method: Method, path: RequestLens<TPath>): RequestLens<TPath>;
export function $request(method: Method, path: string): RequestLens<{}>;
export function $request<TPath>(
  method: Method,
  pathOrString: RequestLens<TPath> | string
): RequestLens<TPath> {

  const path: RequestLens<TPath> =
    typeof pathOrString === 'string'
      ? literal(pathOrString) as any as RequestLens<TPath>
      : pathOrString;

  return new UnionLens(
    new MethodLens(method),
    path);
}
