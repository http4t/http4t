import {HttpRequest} from "@http4t/core/contract";
import {uri} from "@http4t/core/requests";
import {JsonPathResult, prefixFailure} from "@http4t/result/JsonPathResult";
import {RequestLens} from "../routes";
import {UriLens} from "./UriLens";

export class RequestUriLens<T> implements RequestLens<T> {
  constructor(private readonly lens: UriLens<T>) {
  }

  async get(request: HttpRequest): Promise<JsonPathResult<T>> {
    const extract = await this.lens.get(uri(request));
    return prefixFailure(extract, ["uri"]);
  }

  async set(value: T, message: HttpRequest): Promise<HttpRequest> {
    const newUri = await this.lens.set(value, uri(message));
    return {...message, uri: newUri};
  }

}