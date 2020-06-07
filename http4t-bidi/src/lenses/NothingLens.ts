import {HttpMessage} from "@http4t/core/contract";
import {success} from "@http4t/result";
import {JsonPathResult} from "@http4t/result/JsonPathResult";
import {MessageLens} from "../routes";

export class NothingLens<TMessage extends HttpMessage> implements MessageLens<undefined, TMessage> {
  async get(message: TMessage): Promise<JsonPathResult<undefined>> {
    return success(undefined);
  }

  async set(value: undefined, message: TMessage): Promise<TMessage> {
    return message;
  }
}

export function nothing<TMessage extends HttpMessage = HttpMessage>(): NothingLens<TMessage> {
  return new NothingLens<TMessage>();
}