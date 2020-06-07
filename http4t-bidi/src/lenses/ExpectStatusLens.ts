import {HttpResponse} from "@http4t/core/contract";
import {failure, JsonPathResult} from "@http4t/result/JsonPathResult";
import {ResponseLens} from "../routes";

export class ExpectStatusLens<T> implements ResponseLens<T> {
  constructor(private readonly status: number, private readonly lens: ResponseLens<T>) {
  }

  async get(message: HttpResponse): Promise<JsonPathResult<T>> {
    if (message.status != this.status)
      return failure(`Status was not ${this.status}`, ["status"])

    return await this.lens.get(message);
  }

  async set(into: HttpResponse, value: T): Promise<HttpResponse> {
    return this.lens.set({...into, status: this.status}, value);
  }
}

export function response<T>(status: number, lens: ResponseLens<T>): ExpectStatusLens<T> {
  return new ExpectStatusLens(status, lens);
}