import {HttpMessage} from "@http4t/core/contract";
import {isFailure, success} from "@http4t/result";
import {JsonPathResult, merge} from "@http4t/result/JsonPathResult";
import {MessageLens} from "../routes";

export class IntersectionLens<TMessage extends HttpMessage, A, B> implements MessageLens<TMessage, A & B> {
  constructor(private readonly a: MessageLens<TMessage, A>,
              private readonly b: MessageLens<TMessage, B>) {
  }

  async get(message: TMessage): Promise<JsonPathResult<A & B>> {
    const aResult = await this.a.get(message);
    const bResult = await this.b.get(message);

    if (isFailure(aResult)) {
      return isFailure(bResult) ? merge(aResult, bResult) : aResult;
    }
    if (isFailure(bResult)) {
      return bResult;
    }
    return success(aResult.value === undefined && bResult.value === undefined ? undefined as any : {...aResult.value, ...bResult.value});

  }

  async set(into: TMessage, value: A & B): Promise<TMessage> {
    return this.b.set(await this.a.set(into, value), value);
  }
}
