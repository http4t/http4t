import {PathMatcher, PathMatch} from "./index";

export class NoopPath implements PathMatcher<undefined> {
  consume(path: string): PathMatch<undefined> {
    return {
      value: undefined,
      remaining: path
    };
  }

  expand(value: undefined): string {
    return "";
  }
}