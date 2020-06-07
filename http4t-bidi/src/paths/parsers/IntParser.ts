import {success} from "@http4t/result";
import {failure, JsonPathResult} from "@http4t/result/JsonPathResult";
import {PathMatcher} from "../PathMatcher";
import {Parser, ParserPath} from "./index";

const validInt = /^[0-9]+$/;

export class IntParser implements Parser<number> {
  constructor(private readonly radix?: number) {
  }

  parse(pathSegment: string): JsonPathResult<number> {
    const parsed = Number.parseInt(pathSegment, this.radix);

    if (Number.isNaN(parsed) || !pathSegment.match(validInt)) return failure("expected an integer");

    return success(parsed);
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