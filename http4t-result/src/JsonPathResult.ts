import {Failure, mapFailure, Result} from "./index";

/**
 * Just enough of jsonpath to identify a single element- object keys and array indexes
 */
export type JsonPath = (string | number)[];

export function toString(path: JsonPath): string {
    return ['$', ...path].map(x => typeof x === 'string' ? x : `[${x}]`).join('.')
}

/**
 * Has a nice toString()
 */
class NiceJsonPathFailure implements JsonPathFailure {
    constructor(readonly error: Problem[]) {
    }

    toString(): string {
        return this.error.map(problem => problem.toString()).join('\r\n')
    }
}

export function failure(message: string, path?: JsonPath): JsonPathFailure;
export function failure(...problems: Problem[]): JsonPathFailure;
export function failure(first: string | Problem, second: Problem | JsonPath | undefined, ...rest: Problem[]): JsonPathFailure {
    if (typeof first === 'string') return failure(problem(first, second as JsonPath | undefined));
    const problems = [first as Problem, ...(second ? [second as Problem] : []), ...rest];
    return new NiceJsonPathFailure(problems)
}

export function prefixFailure<T>(result: JsonPathResult<T>,
                                 path: JsonPath): JsonPathResult<T> {
    return mapFailure(result, error => prefix(error, path));
}

export class Problem {
    constructor(readonly message: string,
                readonly path: JsonPath
    ) {
    }

    toString(): string {
        return `${toString(this.path)}: ${this.message}`
    }
}

export function merge(a: JsonPathFailure, b: JsonPathFailure): JsonPathFailure {
    return failure(...[...a.error, ...b.error])
}

export function prefix(value: Problems, path: JsonPath): Problems;
export function prefix(value: JsonPathFailure, path: JsonPath): JsonPathFailure;
export function prefix(value: JsonPathFailure | Problems, path: JsonPath): JsonPathFailure | Problems {
    function isJsonPathFailure(value: JsonPathFailure | Problems): value is JsonPathFailure {
        return value.hasOwnProperty('error');
    }

    return isJsonPathFailure(value)
        ? failure(...prefix(value.error, path))
        : value.map(p => problem(p.message, [...path, ...p.path]));
}

export function pathsEq(a: JsonPath, b: JsonPath) {
    return a.length === b.length
        && a.every((v, i) => v === b[i]);
}

export function pathStartsWith(path: JsonPath, startsWith: JsonPath) {
    return path.length >= startsWith.length
        && startsWith.every((v, i) => v === path[i]);
}

export function problem(message: string, path: JsonPath = []): Problem {
    return new Problem(message, path);
}


export type Problems = Problem[];
export type JsonPathFailure = Failure<Problems>;
export type JsonPathResult<T> = Result<Problems, T>;
