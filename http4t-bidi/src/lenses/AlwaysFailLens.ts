import {HttpMessage} from "@http4t/core/contract";
import {MessageLens, RoutingResult} from "../lenses";

export class AlwaysFailLens<TMessage extends HttpMessage, T = never> implements MessageLens<TMessage, T> {
  constructor(private readonly error: RoutingResult<T>) {
  }

  async get(message: TMessage): Promise<RoutingResult<T>> {
    return this.error;
  }

  async set(into: TMessage, value: T): Promise<TMessage> {
    return into;
  }
}

export function alwaysFail<TMessage extends HttpMessage = HttpMessage, T = never>(error: RoutingResult<T>): MessageLens<TMessage, T> {
  return new AlwaysFailLens<TMessage, T>(error);
}