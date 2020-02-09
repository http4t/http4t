import {stripSlashes} from "@http4t/core/uri";
import {ConsumeUntil} from "./ConsumeUntil";
import {PathMatch, PathMatcher} from "./index";

export class Literal implements PathMatcher<undefined> {
  private readonly strippedText: string;
  private readonly base: ConsumeUntil;

  constructor(private readonly text: string) {
    const strippedText = stripSlashes(text);
    const consumer = (path: string) => path.startsWith(strippedText) ? strippedText.length : -1;
    this.base = new ConsumeUntil(consumer);
    this.strippedText = stripSlashes(text);
  }

  consume(path: string): PathMatch<undefined> {
    const result = this.base.consume(path);
    if (typeof result === 'undefined') return result;
    return {
      ...result,
      value: undefined
    };
  }

  expand(value: undefined): string {
    return this.text;
  }
}

export function literal(text: string): PathMatcher<undefined> {
  return new Literal(text);
}