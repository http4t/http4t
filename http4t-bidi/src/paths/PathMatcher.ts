import {JsonPathResult} from "@http4t/result/JsonPathResult";

export type Matched<T> = {
  value: T,
  remaining: string
};
export type PathMatch<T> = JsonPathResult<Matched<T>>;

export interface PathMatcher<T> {
  consume(path: string): PathMatch<T>;

  expand(value: T): string;
}

export function isPathMatcher<T>(value: any): value is PathMatcher<T> {
  return typeof value['consume'] === 'function' && typeof value['expand'] === 'function'
}