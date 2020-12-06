// Types
// ------------------------------------------------------------------------------------------
/**
 * A rough port of https://github.com/npryce/result4k/blob/master/src/main/kotlin/com/natpryce/result.kt,
 * but with the order of the type params reversed to the more idiomatic <E,T>
 */
export type Failure<E> = {
    readonly error: E;
}

export type Success<T> = {
    readonly value: T;
}

export type Result<E, T> = Success<T> | Failure<E>;

export function isSuccess<E = unknown, T = unknown>(result: Result<E, T>): result is Success<T> {
    return result.hasOwnProperty('value');
}

export function isFailure<E = unknown, T = unknown>(result: Result<E, T>): result is Failure<E> {
    return result.hasOwnProperty('error');
}

export function success<T>(value: T): Success<T> {
    return {value};
}

export function failure<E>(error: E): Failure<E> {
    return {error};
}

/**
 * Map a function over the value of a successful Result.
 */
export function map<E = unknown, T = unknown, T1 = T>(
    result: Result<E, T>,
    f: (success: T) => T1): Result<E, T1>;
/**
 * Map functions over value or error
 */
export function map<E = unknown, E1 = unknown, T = unknown, T1 = T>(
    result: Result<E, T>,
    onSuccess: (success: T) => T1,
    onFailure: (error: E) => E1): Result<E1, T1>;
export function map<E = unknown, E1 = E, T = unknown, T1 = T>(
    result: Result<E, T>,
    onSuccess: (success: T) => T1,
    onFailure: (error: E) => E1 = error => error as any): Result<E1, T1> {
    return isSuccess(result)
        ? success(onSuccess(result.value))
        : failure(onFailure(result.error));
}

/**
 * Flat-map a function over the _value_ of a successful Result.
 */
export function flatMap<E = unknown, T = unknown, T1 = T>(
    result: Result<E, T>,
    f: (success: T) => Result<E, T1>): Result<E, T1> {
    return isSuccess(result) ? f(result.value) : result;
}

/**
 * Map a function over the _reason_ of an unsuccessful Result.
 */
export function mapFailure<E = unknown, E1 = E, T = unknown>(
    result: Result<E, T>,
    f: (error: E) => E1): Result<E1, T> {
    return isSuccess(result) ? result : failure(f(result.error));
}

/**
 * Flat-map a function over the _reason_ of a unsuccessful Result.
 */
export function flatMapFailure<E = unknown, E1 = E, T = unknown>(
    result: Result<E, T>,
    f: (failure: E) => Result<E1, T>): Result<E1, T> {
    return isSuccess(result) ? result : f(result.error);
}

/**
 * Unwrap a Result in which both the success and failure values have the same type, returning a plain value.
 */
export function get<T>(result: Result<T, T>): T {
    return isSuccess(result) ? result.value : result.error;
}

/**
 * Unwrap a Result, by returning the success value or throwing the result of block on failure to abort
 * from the current function.
 */
export function onFailure<E, T>(result: Result<E, T>, block: (error: E) => any = error => error): T {
    if (isSuccess(result)) return result.value;
    throw block(result.error);
}


/**
 * Unwrap a Result by returning the success value or calling errorToValue to mapping the failure reason to a plain value.
 */
export function recover<S, T extends S, U extends S, E>(result: Result<E, T>, errorToValue: (error: E) => U): S {
    return get(mapFailure(result, errorToValue) as Result<S, S>);
}

/**
 * Perform a side effect with the success value.
 */
export function peek<E, T, R = void>(result: Result<E, T>, f: (value: T) => R): R | undefined {
    return isSuccess(result) ? f(result.value) : undefined;
}

/**
 * Perform a side effect with the failure value.
 */
export function peekFailure<E, T, R = void>(result: Result<E, T>, f: (error: E) => R): R | undefined {
    return isSuccess(result) ? undefined : f(result.error);
}
