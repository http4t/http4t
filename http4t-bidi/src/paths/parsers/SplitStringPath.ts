import {success} from "@http4t/result";
import {JsonPathResult} from "@http4t/result/JsonPathResult";
import {PathMatcher} from "../PathMatcher";
import {Parser, ParserPath} from "./index";

class SplitStringParser implements Parser<string[]> {
  constructor(private readonly separator: string) {
  }

  parse(pathSegment: string): JsonPathResult<string[]> {
    return success(pathSegment.split(this.separator));
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