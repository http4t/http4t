import {Failure, mapFailure, Result} from "./index";

/**
 * Just enough of jsonpath to identify a single element- object keys and array indexes
 */
export type JsonPath = (string | number)[];

export function pathToString(path: JsonPath): string {
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
                readonly path: JsonPath,
                /**
                 * A hint to indicate where this problem was produced.
                 *
                 * Useful for example when we have a process where we want to check an object matches one of two schemas,
                 * but we are given a value that matches neither.
                 *
                 * In this case we want to see all the problems from both schemas in our error, but we want to be able
                 * to distinguish which problems came from the first schema and which came from the second.
                 */
                readonly producedBy: string | undefined
    ) {
    }

    toString(): string {
        return `${this.producedBy ? `[${this.producedBy}] ` : ""}${pathToString(this.path)}: ${this.message}`
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

export function modifyProducedBy(value: Problems, producedBy: string): Problems;
export function modifyProducedBy(value: Problems, producedBy: (old: string | undefined) => string): Problems;
export function modifyProducedBy(value: Problems, producedBy: string | ((old: string | undefined) => string)): Problems {
    return value.map(p => problem(p.message, p.path, typeof producedBy === "string" ? producedBy : producedBy((p.producedBy))));
}

export function prefixProducedBy(value: Problems, prefix: string, delimiter:string = ";"): Problems{
    return modifyProducedBy(value, old => old ? prefix + delimiter + old: prefix);
}

export function pathsEq(a: JsonPath, b: JsonPath) {
    return a.length === b.length
        && a.every((v, i) => v === b[i]);
}

export function pathStartsWith(path: JsonPath, startsWith: JsonPath) {
    return path.length >= startsWith.length
        && startsWith.every((v, i) => v === path[i]);
}

export function problem(message: string, path: JsonPath = [], producedBy: string | undefined = undefined): Problem {
    return new Problem(message, path, producedBy);
}


export type Problems = Problem[];
export type JsonPathFailure = Failure<Problems>;
export type JsonPathResult<T> = Result<Problems, T>;
