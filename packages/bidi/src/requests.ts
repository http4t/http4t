import {HttpMessage, HttpRequest, Method} from "@http4t/core/contract";
import {MessageLens, RequestLens} from "./lenses";
import {intersect} from "./lenses/IntersectionLens";
import {expectMethod} from "./lenses/MethodLens";
import {PathLens} from "./lenses/PathLens";
import {literal} from "./paths/Literal";
import {PathMatcher} from "./paths/PathMatcher";
import {named} from "./messages";

export type PathLike<TPath = undefined> = PathMatcher<TPath> | string;

export function request(method: Method, path: string): RequestLens<undefined>;
export function request<TPath>(method: Method, path: PathMatcher<TPath>): RequestLens<TPath>;

export function request<TBody = unknown>(
    method: Method,
    path: string,
    body: RequestLens<TBody> | MessageLens<HttpMessage, TBody>): RequestLens<TBody>;

export function request<TPath, TBody = unknown>(
    method: Method,
    path: PathLike<TPath>,
    body: RequestLens<TBody> | MessageLens<HttpMessage, TBody>): RequestLens<{ path: TPath, body: TBody }>;


export function request<TPath extends object, TBody extends object>(
    method: Method,
    pathLike: PathLike<TPath>,
    body?: RequestLens<TBody> | MessageLens<HttpMessage, TBody>
): RequestLens<TPath> | RequestLens<TBody> | RequestLens<{ path: TPath, body: TBody }> {

    const path: RequestLens<TPath> =
        typeof pathLike === 'string'
            ? new PathLens(literal(pathLike)) as any as PathLens<TPath>
            : new PathLens(pathLike);

    const methodAndPath: MessageLens<HttpRequest, TPath> = intersect(
        expectMethod(method),
        path);

    return body
        ? typeof pathLike === 'string'
            ? intersect(methodAndPath as any as RequestLens<undefined>, body) as RequestLens<TBody>
            : named({
                path: methodAndPath,
                body
            })
        : methodAndPath;
}

export {path} from "./paths/index"
export * from "./messages"
export {method, expectMethod} from "./lenses/MethodLens"
