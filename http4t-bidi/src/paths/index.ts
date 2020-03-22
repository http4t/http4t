import {join} from "./Joined";
import {literal} from "./Literal";
import {PathMatcher} from "./PathMatcher";
import {SegmentsFn, VariablePaths, variablesPath} from "./variables";

export function path(literal: string): PathMatcher<{}> ;

export function path<T extends object>(vars: VariablePaths<T>, segmentFn: SegmentsFn<T>): PathMatcher<T>;

export function path<A, B>(a: PathMatcher<A>, b: PathMatcher<B>): PathMatcher<A & B>;

export function path<A, B, C>(a: PathMatcher<A>, b: PathMatcher<B>, c: PathMatcher<C>): PathMatcher<A & B & C>;

export function path<A, B, C, D>(a: PathMatcher<A>, b: PathMatcher<B>, c: PathMatcher<C>, d: PathMatcher<D>): PathMatcher<A & B & C & D>;

export function path<A, B, C, D, E>(a: PathMatcher<A>, b: PathMatcher<B>, c: PathMatcher<C>, d: PathMatcher<D>, e: PathMatcher<E>): PathMatcher<A & B & C & D & E>;

export function path<T extends object>(...segments: PathMatcher<T>[]): PathMatcher<T>;

export function path<T extends object>(
  first: string | VariablePaths<T> | PathMatcher<T>,
  second?: SegmentsFn<T> | PathMatcher<T>,
  ...rest: PathMatcher<T>[])
  : PathMatcher<T> | PathMatcher<undefined> {

  if (typeof first === "string") return literal(first);
  if (typeof second === "function") return variablesPath(first as VariablePaths<T>, second);
  return join<T>(first as PathMatcher<T>, second as PathMatcher<T>, ...rest as PathMatcher<T>[]);
}


