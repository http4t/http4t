import {HttpMessage} from "@http4t/core/contract";
import {failure, isFailure, Problem, Result, success} from "@http4t/result";
import {MessageLens} from "../routes";

type Lenses<T, TMessage extends HttpMessage> = { [K in keyof T]: MessageLens<T[K], TMessage> };

export class NamedLenses<T, TMessage extends HttpMessage> implements MessageLens<T, TMessage> {
  constructor(private readonly lenses: Lenses<T, TMessage>) {
  }

  async extract(output: TMessage): Promise<Result<T>> {
    let problems: Problem[] = [];
    const value: T = {} as T;

    for (const [k, lens] of Object.entries(this.lenses)) {

      const result: Result<any> = await (lens as MessageLens<any, TMessage>).extract(output);

      if (isFailure(result)) {
        problems = [...problems, ...result.problems];
        continue;
      }
      value[k as keyof T] = result.value;
    }
    return problems.length > 0 ? failure(...problems) : success(value);
  }

  inject(input: T, output: TMessage): Promise<TMessage> {
    const injectField = async (message: Promise<TMessage>, [k, lens]: [string, unknown]): Promise<TMessage> => {
      return await (lens as MessageLens<any, TMessage>).inject(input[k as keyof T], await message);
    };
    return Object.entries(this.lenses).reduce(injectField, Promise.resolve(output));
  }
}

export function named<T, TMessage extends HttpMessage>(lenses: Lenses<T, TMessage>): MessageLens<T, TMessage> {
  return new NamedLenses(lenses);
}