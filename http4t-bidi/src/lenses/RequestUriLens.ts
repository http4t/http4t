import {HttpRequest} from "@http4t/core/contract";
import {uri} from "@http4t/core/requests";
import {isFailure, prefix, Result} from "@http4t/result";
import {RequestLens} from "../routes";
import {UriLens} from "./UriLens";

export class RequestUriLens<T> implements RequestLens<T> {
  constructor(private readonly lens: UriLens<T>) {
  }

  async extract(request: HttpRequest): Promise<Result<T>> {
    const extract = await this.lens.extract(uri(request));
    if (isFailure(extract)) return prefix(extract, ["uri"]);
    return extract;
  }

  async inject(value: T, message: HttpRequest): Promise<HttpRequest> {
    const newUri = await this.lens.inject(value, uri(message));
    return {...message, uri: newUri};
  }

}