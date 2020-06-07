import {failure, success} from "@http4t/result";
import {PathMatcher} from "../PathMatcher";
import {Parser, ParserPath, ParserResult} from "./index";

class FloatParser implements Parser<number> {
  parse(pathSegment: string): ParserResult<number> {
    const parsed = +pathSegment;

    if (Number.isNaN(parsed)) return failure("expected a number");

    return success(parsed);
  }

  unparse(value: number): string {
    return value.toString();
  }
}

export class FloatPath extends ParserPath<number> {
  constructor(base: PathMatcher<string>) {
    super(base, new FloatParser())
  }
}