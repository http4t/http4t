import {HttpMessage} from "@http4t/core/contract";
import {isFailure, merge, Result, success} from "@http4t/result";
import {MessageLens} from "../routes";

export class UnionLens<A, B, TMessage extends HttpMessage> implements MessageLens<A & B, TMessage> {
  constructor(private readonly a: MessageLens<A, TMessage>,
              private readonly b: MessageLens<B, TMessage>) {
  }

  async extract(message: TMessage): Promise<Result<A & B>> {
    const aResult = await this.a.extract(message);
    const bResult = await this.b.extract(message);
    if (isFailure(aResult)) {
      return isFailure(bResult) ? merge(aResult, bResult) : aResult;
    }
    if (isFailure(bResult)) {
      return bResult;
    }
    return success({...aResult.value, ...bResult.value});

  }

  async inject(value: A & B, message: TMessage): Promise<TMessage> {
    return this.b.inject(
      value,
      await this.a.inject(value, message));
  }
}
