import {stripSlashes} from "@http4t/core/uri";
import {map} from "@http4t/result";
import {ConsumeUntil} from "./ConsumeUntil";
import {PathMatcher, PathResult} from "./PathMatcher";

/**
 * PathMatcher that consumes {text} from a uri path
 *
 * {test} may include slashes
 *
 * Matcher will consume leading slashes, i.e.
 *
 * `new Literal("widgets/on-sale")` will match any of these:
 *
 * ```
 * widgets/on-sale/100
 * //widgets/on-sale/100
 * /widgets/on-sale/100
 * ```
 */
export class Literal implements PathMatcher<undefined> {
  private readonly strippedText: string;
  private readonly base: ConsumeUntil;

  constructor(private readonly text: string) {
    this.strippedText = stripSlashes(text);

    const consumer = (path: string) => path.startsWith(this.strippedText)
      ? this.strippedText.length
      : -1;

    this.base = new ConsumeUntil(consumer);
  }

  consume(path: string): PathResult<undefined> {
    const result = this.base.consume(path);
    return map(result, value => ({...value, value: undefined }))
  }

  expand(value: undefined): string {
    return this.text;
  }
}

export function literal(text: string): PathMatcher<undefined> {
  return new Literal(text);
}