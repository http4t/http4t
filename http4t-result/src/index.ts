// Types
// ------------------------------------------------------------------------------------------

/**
 * Just enough of jsonpath to identify a single element- object keys and array indexes
 */
export type JsonPath = (string | number)[];

export class Problem {
  constructor(readonly message: string,
              readonly path: JsonPath
  ) {
  }

  toString(): string {
    return `${unparse(this.path)}: ${this.message}`
  }
}

export class Failure {
  constructor(readonly problems: Readonly<Problem[]>) {
  }

  toString(): string {
    return this.problems.map(problem => problem.toString()).join('\r\n');
  }
}

export type Success<T> = {
  readonly value: T;
}

export type Result<T> = Success<T> | Failure;

// Convenience functions
// ------------------------------------------------------------------------------------------

export function isSuccess<T>(result: Result<T>): result is Success<T> {
  return result.hasOwnProperty('value');
}

export function isFailure<T>(result: Result<T>): result is Failure {
  return result.hasOwnProperty('problems');
}

export function merge(a: Failure, b: Failure): Failure {
  return failure(...[...a.problems, ...b.problems])
}

export function prefix(value: Failure, path: JsonPath): Failure {
  return failure(...value.problems.map(p => problem(p.message, [...path, ...p.path])))
}

export function pathsEq(a: JsonPath, b: JsonPath) {
  return a.length === b.length
    && a.every((v, i) => v === b[i]);
}

export function pathStartsWith(path: JsonPath, startsWith: JsonPath) {
  return path.length >= startsWith.length
    && startsWith.every((v, i) => v === path[i]);
}

export function unparse(path: JsonPath): string {
  return ['$', ...path].map(x => typeof x === 'string' ? x : `[${x}]`).join('.')
}

// Constructors
// ------------------------------------------------------------------------------------------

export function success<T>(value: T): Success<T> {
  return {value};
}

export function problem(message: string, path: JsonPath = []): Problem {
  return new Problem(message, path);
}

export function failure(message: string, path?: JsonPath): Failure;
export function failure(...problems: Problem[]): Failure;
export function failure(first: string | Problem, second: Problem | JsonPath | undefined, ...rest: Problem[]): Failure {
  if (typeof first === 'string') return failure(problem(first, second as JsonPath | undefined));
  const problems = [first as Problem, ...(second ? [second as Problem] : []), ...rest];
  return new Failure(problems)
}

export function map<T, U>(result: Result<T>,
                          onSuccess: (t: T) => U,
                          onFailure: (f: Failure) => Result<U> = f => f): Result<U> {
  return isFailure(result) ? onFailure(result) : success(onSuccess(result.value));
}

export function prefixFailure<T>(result: Result<T>,
                                    path: JsonPath): Result<T> {
  return map(result, s => s, f => prefix(f, path));
}