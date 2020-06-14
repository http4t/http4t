import {failure, success} from "@http4t/result";
import {PathMatcher} from "../PathMatcher";
import {Parser, ParserPath, ParserResult} from "./index";

const validInt = /^[0-9]+$/;

export class IntParser implements Parser<number> {
    constructor(private readonly radix?: number) {
    }

    parse(pathSegment: string): ParserResult<number> {
        const parsed = Number.parseInt(pathSegment, this.radix);

        return Number.isNaN(parsed) || !pathSegment.match(validInt)
            ? failure("expected an integer")
            : success(parsed);
    }

    unparse(value: number): string {
        return value.toString(this.radix);
    }
}

export class IntPath extends ParserPath<number> {
    constructor(base: PathMatcher<string>, radix?: number) {
        super(base, new IntParser(radix))
    }
}