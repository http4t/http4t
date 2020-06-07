import {HttpMessage} from "@http4t/core/contract";
import {success} from "@http4t/result";
import {MessageLens, RoutingResult} from "../routes";

export class NothingLens<TMessage extends HttpMessage> implements MessageLens<TMessage, undefined> {
  async get(message: TMessage): Promise<RoutingResult<undefined>> {
    return success(undefined);
  }

  async set(into: TMessage, value: undefined): Promise<TMessage> {
    return into;
  }
}

export function nothing<TMessage extends HttpMessage = HttpMessage>(): NothingLens<TMessage> {
  return new NothingLens<TMessage>();
}