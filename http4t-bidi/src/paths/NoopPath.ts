import {success} from "@http4t/result";
import {PathMatch, PathMatcher} from "./index";

export class NoopPath implements PathMatcher<undefined> {
  consume(path: string): PathMatch<undefined> {
    return success({
      value: undefined,
      remaining: path
    });
  }

  expand(value: undefined): string {
    return "";
  }
}