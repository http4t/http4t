import {HttpRequest} from "@http4t/core/contract";
import {uri} from "@http4t/core/requests";
import {JsonPathResult, prefixFailure} from "@http4t/result/JsonPathResult";
import {RequestLens} from "../routes";
import {UriLens} from "./UriLens";

export class RequestUriLens<T> implements RequestLens<T> {
  constructor(private readonly lens: UriLens<T>) {
  }

  async extract(request: HttpRequest): Promise<JsonPathResult<T>> {
    const extract = await this.lens.extract(uri(request));
    return prefixFailure(extract, ["uri"]);
  }

  async inject(value: T, message: HttpRequest): Promise<HttpRequest> {
    const newUri = await this.lens.inject(value, uri(message));
    return {...message, uri: newUri};
  }

}