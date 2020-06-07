import {HttpResponse} from "@http4t/core/contract";
import {failure, JsonPathResult} from "@http4t/result/JsonPathResult";
import {ResponseLens} from "../routes";

export class ExpectStatusLens<T> implements ResponseLens<T> {
  constructor(private readonly status: number, private readonly lens: ResponseLens<T>) {
  }

  async extract(message: HttpResponse): Promise<JsonPathResult<T>> {
    if (message.status != this.status)
      return failure(`Status was not ${this.status}`, ["status"])

    return await this.lens.extract(message);
  }

  async inject(value: T, message: HttpResponse): Promise<HttpResponse> {
    return this.lens.inject(value, {...message, status: this.status});
  }
}

export function response<T>(status: number, lens: ResponseLens<T>): ExpectStatusLens<T> {
  return new ExpectStatusLens(status, lens);
}