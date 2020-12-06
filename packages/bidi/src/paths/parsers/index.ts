import {isFailure, map, Result} from "@http4t/result";
import {PathMatcher, PathResult} from "../PathMatcher";

export type ParserResult<T> = Result<string, T>;

export interface Parser<T> {
    parse(value: string): ParserResult<T>;

    unparse(value: T): string;
}

export abstract class ParserPath<T> implements PathMatcher<T> {
    protected constructor(private readonly base: PathMatcher<string>,
                          private readonly parser: Parser<T>) {
    }

    consume(path: string): PathResult<T> {
        const result = this.base.consume(path);
        if (isFailure(result)) return result;

        const parsed = this.parser.parse(result.value.value);

        return map(
            parsed,
            value => ({
                ...result.value,
                value: value
            }),
            error => ({message: error, remaining: path}))
    }

    expand(value: T): string {
        return this.base.expand(this.parser.unparse(value));
    }
}