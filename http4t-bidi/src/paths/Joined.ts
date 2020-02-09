import {join as joinPath} from "path";
import {PathMatch, PathMatcher} from "./index";
import {NoopPath} from "./NoopPath";

export class Joined<A, B> implements PathMatcher<A & B> {
  constructor(private readonly a: PathMatcher<A>,
              private readonly b: PathMatcher<B>) {
  }

  consume(path: string): PathMatch<A & B> {
    const a = this.a.consume(path);
    if (typeof a === 'undefined') return a;

    const b = this.b.consume(a.remaining);
    if (typeof b === 'undefined') return b;

    const value = {...a.value, ...b.value};

    return {
      value,
      remaining: b.remaining
    };

  }

  expand(value: A & B): string {
    return joinPath(this.a.expand(value), this.b.expand(value));
  }
}

/**
 * Note- not typesafe. Prefer path()
 */
export function join<T>(...segments: PathMatcher<any>[]): PathMatcher<T> {
  return segments.reduce((acc, segment) => new Joined(acc, segment), new NoopPath()) as PathMatcher<T>;
}