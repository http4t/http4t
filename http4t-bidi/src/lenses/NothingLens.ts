import {HttpMessage} from "@http4t/core/contract";
import {Result, success} from "@http4t/result";
import {MessageLens} from "../routes";

export class NothingLens<TMessage extends HttpMessage> implements MessageLens<undefined, TMessage> {
  async extract(message: TMessage): Promise<Result<undefined>> {
    return success(undefined);
  }

  async inject(value: undefined, message: TMessage): Promise<TMessage> {
    return message;
  }
}

export function nothing<TMessage extends HttpMessage = HttpMessage>(): NothingLens<TMessage> {
  return new NothingLens<TMessage>();
}