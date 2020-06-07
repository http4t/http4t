import {HttpMessage} from "@http4t/core/contract";
import {getHeaderValue} from "@http4t/core/headers";
import {setHeader} from "@http4t/core/messages";
import {response} from "@http4t/core/responses";
import {success} from "@http4t/result";
import {MessageLens, routeFailed, RoutingResult} from "../routes";

export class HeaderLens<TMessage extends HttpMessage> implements MessageLens<TMessage, string> {
  constructor(private name: string) {
  }

  async get(output: TMessage): Promise<RoutingResult<string>> {
    const headerValue = getHeaderValue(output.headers, this.name);
    return headerValue ? success(headerValue) : routeFailed(`Expected header "${this.name}"`, response(400))
  }

  async set(into: TMessage, value: string): Promise<TMessage> {
    return setHeader(into, this.name, value);
  }
}