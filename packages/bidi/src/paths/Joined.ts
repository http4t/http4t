import {isFailure, success} from "@http4t/result";
import {NoopPath} from "./NoopPath";
import {PathMatcher, PathResult} from "./PathMatcher";
import {stripSlashes} from "@http4t/core/uri";

export class Joined<A, B> implements PathMatcher<A & B> {
    constructor(private readonly a: PathMatcher<A>,
                private readonly b: PathMatcher<B>) {
    }

    consume(path: string): PathResult<A & B> {
        const a = this.a.consume(path);
        if (isFailure(a)) return a;

        const b = this.b.consume(a.value.remaining);
        if (isFailure(b)) return b;

        const value = {...a.value.value, ...b.value.value};

        return success(
            {
                value,
                remaining: b.value.remaining
            }
        );

    }

    expand(value: A & B): string {
        return [
            stripSlashes(this.a.expand(value)),
            stripSlashes(this.b.expand(value))]
            .join("/");
    }
}

/**
 * Note- not typesafe. Prefer path()
 */
export function join<T>(...segments: PathMatcher<any>[]): PathMatcher<T> {
    return segments.reduce((acc, segment) => new Joined(acc, segment), new NoopPath()) as PathMatcher<T>;
}