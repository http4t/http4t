import {map} from "@http4t/result";
import {exactlyChars, exactlySegments, upToChars, upToSegments} from "./consume";
import {ConsumeUntil} from "./ConsumeUntil";
import {join} from "./Joined";
import {literal} from "./Literal";
import {BooleanPath} from "./parsers/BooleanPath";
import {FloatPath} from "./parsers/FloatPath";
import {IntPath} from "./parsers/IntParser";
import {SplitStringPath} from "./parsers/SplitStringPath";
import {PathResult, PathMatcher} from "./PathMatcher";

export const v = {
  segment: ConsumeUntil.nextSlashOrEnd,

  upToChars: (count: number) => new ConsumeUntil(upToChars(count)),

  exactlyChars: (count: number) => new ConsumeUntil(exactlyChars(count)),

  upToSegments: (count: number) => new SplitStringPath(
    new ConsumeUntil(upToSegments(count)),
    '/'),

  exactlySegments: (count: number) => new SplitStringPath(
    new ConsumeUntil(exactlySegments(count)),
    '/'),

  restOfPath: new SplitStringPath(ConsumeUntil.endOfPath, '/'),

  restOfPathSegments: new SplitStringPath(ConsumeUntil.endOfPath, '/'),

  boolean: new BooleanPath(ConsumeUntil.nextSlashOrEnd),

  float: new FloatPath(ConsumeUntil.nextSlashOrEnd),

  int: new IntPath(ConsumeUntil.nextSlashOrEnd),

  binary: new IntPath(ConsumeUntil.nextSlashOrEnd, 2),

  hex: new IntPath(ConsumeUntil.nextSlashOrEnd, 16),
};

export type VariablePaths<T extends object> = { readonly [K in keyof T]: PathMatcher<T[K]> };

export type Variable<T, K extends keyof T = keyof T> = { key: K };
export type Variables<T extends object> = { readonly [K in keyof T]: Variable<T, K> };

export class VariablePath<T, K extends keyof T> implements PathMatcher<{ K: T[K] }> {
  constructor(
    private readonly key: K,
    private readonly value: PathMatcher<T[K]>) {
  }

  consume(path: string): PathResult<{ K: T[K] }> {
    return map(
      this.value.consume(path),
      value => ({...value, value: {[this.key]: value.value} as { K: T[K] }}));
  }

  expand(value: { K: T[K] }): string {
    return this.value.expand((value as any)[this.key]);
  }

}

export type SegmentsFn<T extends object> = (vars: Variables<T>) => (Variable<T> | string)[];

export function variablesPath<T extends object>(
  variablePaths: VariablePaths<T>,
  segmentFn: SegmentsFn<T>)
  : PathMatcher<T> {

  const variables = Object.keys(variablePaths).reduce((acc, key) => {
    (acc as any)[key] = {key};
    return acc
  }, {} as Variables<T>);
  const segments = segmentFn(variables);

  const segmentKeys = segments.reduce(
    (keys, segment) =>
      typeof segment === 'string' ? keys : keys.add(segment.key),
    new Set<keyof T>());

  const variableKeys = Object.keys(variablePaths) as (keyof T)[];

  const missingKeys = variableKeys.filter(k => !segmentKeys.has(k));
  if (missingKeys.length > 0) throw new Error(`segmentFn did not populate all keys. Missing: ${missingKeys.join(', ')}`);

  const segmentPaths: (PathMatcher<undefined> | VariablePath<T, keyof T>)[] = segments.map(s => typeof s === 'string'
    ? literal(s)
    : new VariablePath(s.key, variablePaths[s.key]));
  return join(...segmentPaths);
}