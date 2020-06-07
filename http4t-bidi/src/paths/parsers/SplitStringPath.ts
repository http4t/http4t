import {success} from "@http4t/result";
import {PathMatcher} from "../PathMatcher";
import {Parser, ParserPath, ParserResult} from "./index";

class SplitStringParser implements Parser<string[]> {
  constructor(private readonly separator: string) {
  }

  parse(pathSegment: string): ParserResult<string[]> {
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