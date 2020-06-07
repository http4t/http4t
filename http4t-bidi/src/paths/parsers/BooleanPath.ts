import {success} from "@http4t/result";
import {failure, JsonPathResult} from "@http4t/result/JsonPathResult";
import {PathMatcher} from "../PathMatcher";
import {Parser, ParserPath} from "./index";

class BooleanParser implements Parser<boolean> {
  parse(pathSegment: string): JsonPathResult<boolean> {
    if (pathSegment.toLowerCase() === "true") return success(true);
    if (pathSegment.toLowerCase() === "false") return success(false);
    return failure("Expected 'true' or 'false'");
  }

  unparse(value: boolean): string {
    return value.toString();
  }
}

export class BooleanPath extends ParserPath<boolean> {
  constructor(base: PathMatcher<string>) {
    super(base, new BooleanParser())
  }
}