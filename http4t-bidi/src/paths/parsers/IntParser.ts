import {failure, Result, success} from "@http4t/result";
import {PathMatcher} from "../index";
import {Parser, ParserPath} from "./index";

const validInt = /^[0-9]+$/;

export class IntParser implements Parser<number> {
  constructor(private readonly radix?: number) {
  }

  parse(value: string): Result<number> {
    const parsed = Number.parseInt(value, this.radix);

    if (Number.isNaN(parsed) || !value.match(validInt)) return failure("expected an integer");

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