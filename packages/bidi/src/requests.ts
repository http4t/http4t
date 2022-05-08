import {HttpMessage, Method} from "@http4t/core/contract";
import {MessageLens, RequestLens} from "./lenses";
import {intersect, IntersectionLens} from "./lenses/IntersectionLens";
import {expectMethod} from "./lenses/MethodLens";
import {PathLens} from "./lenses/PathLens";
import {literal} from "./paths/Literal";
import {isPathMatcher, PathMatcher} from "./paths/PathMatcher";

export type PathLike<TPath = undefined> = RequestLens<TPath> | PathMatcher<TPath> | string

export function request<TPath>(method: Method, path: RequestLens<TPath> | PathMatcher<TPath>): RequestLens<TPath>;
export function request(method: Method, path: string): RequestLens<undefined>;

export function request<TBody = unknown>(
    method: Method,
    path: string,
    body: RequestLens<TBody> | MessageLens<HttpMessage, TBody>): RequestLens<TBody>;

export function request<TPath, TBody = unknown>(
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
        expectMethod(method),
        path);

    return body
        ? intersect(methodAndPath, body as RequestLens<TBody>)
        : methodAndPath;
}

export {path} from "./paths/index"
export * from "./messages"
export {method, expectMethod} from "./lenses/MethodLens"
