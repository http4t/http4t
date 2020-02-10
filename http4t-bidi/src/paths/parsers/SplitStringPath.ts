import {Result, success} from "@http4t/result";
import {PathMatcher} from "../index";
import {Parser, ParserPath} from "./index";

class SplitStringParser implements Parser<string[]> {
  constructor(private readonly separator: string) {
  }

  parse(value: string): Result<string[]> {
    return success(value.split(this.separator));
  }

  unparse(value: string[]): string {
    return value.join(this.separator);
  }
}

export class SplitStringPath extends ParserPath<string[]> {
  constructor(base: PathMatcher<string>, separator: string) {
    super(base, new SplitStringParser(separator))
  }
}