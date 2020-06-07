import {success} from "@http4t/result";
import {failure} from "@http4t/result/JsonPathResult";
import {
  consume,
  endOfPath,
  exactlyChars,
  exactlySegments,
  nextSlashOrEnd,
  PathConsumer,
  upToChars,
  upToSegments
} from "./consume";
import {PathMatch, PathMatcher} from "./PathMatcher";

export class ConsumeUntil implements PathMatcher<string> {
  static nextSlashOrEnd = new ConsumeUntil(nextSlashOrEnd);
  static endOfPath = new ConsumeUntil(endOfPath);

  constructor(private readonly consumer: PathConsumer) {
  }

  static exactlyChars(count: number): PathMatcher<string> {
    return new ConsumeUntil(exactlyChars(count));
  }

  static upToChars(count: number): PathMatcher<string> {
    return new ConsumeUntil(upToChars(count));
  }

  static exactlySegments(count: number): PathMatcher<string> {
    return new ConsumeUntil(exactlySegments(count));
  }

  static upToSegments(count: number): PathMatcher<string> {
    return new ConsumeUntil(upToSegments(count));
  }

  consume(path: string): PathMatch<string> {
    const consumed = consume(path, this.consumer);
    if (!consumed) return failure("path did not match");

    return success({
      value: consumed.captured,
      remaining: consumed.remaining
    });
  }

  expand(value: string): string {
    return value;
  }
}
