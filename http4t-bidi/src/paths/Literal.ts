import {HttpRequest} from "@http4t/core/contract";
import {uri} from "@http4t/core/requests";
import {joinPaths} from "@http4t/core/uri";
import {failure, Result, success} from "@http4t/result";
import {RequestLens} from "../routes";

export class Literal implements RequestLens<undefined> {
  constructor(private readonly value: string) {
  }

  async extract(request: HttpRequest): Promise<Result<undefined>> {
    if (request.uri.path.startsWith(this.value)) return success(undefined);
    return failure("path did not match", ['uri', 'path']);
  }

  async inject(value: undefined, message: HttpRequest): Promise<HttpRequest> {
    const path = joinPaths(message.uri.path, this.value);
    return {
      ...message,
      uri: {
        ...message.uri,
        path
      }
    };
  }
}

export function literal(text: string): Literal {
  return new Literal(text);
}