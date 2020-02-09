import {ConsumeUntil} from "./ConsumeUntil";
import {PathMatch, PathMatcher} from "./index";
import {join} from "./Joined";
import {literal} from "./Literal";

export const v = {
  segment: ConsumeUntil.nextSlashOrEnd,
  restOfPath: ConsumeUntil.endOfPath,
};

export type VariablePaths<T> = { [K in keyof T]: PathMatcher<T[K]> };

export type Variable<T, K extends keyof T = keyof T> = { key: K };
export type Variables<T> = { [K in keyof T]: Variable<T, K> };

export type SegmentFn<T extends object> = (vars: Variables<T>) => (Variable<T> | string)[];

export class VariablePath<T, K extends keyof T> implements PathMatcher<{ K: T[K] }> {
  constructor(
    private readonly key: K,
    private readonly value: PathMatcher<T[K]>) {
  }

  consume(path: string): PathMatch<{ K: T[K] }> {
    const result = this.value.consume(path);
    if (typeof result === 'undefined') return result;
    return {
      ...result,
      value: {[this.key]: result.value} as { K: T[K] }
    };
  }

  expand(value: { K: T[K] }): string {
    return this.value.expand((value as any)[this.key]);
  }

}

export function variablesPath<T extends object>(
  variablePaths: VariablePaths<T>,
  segmentFn: SegmentFn<T>)
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