import {HttpResponse} from "@http4t/core/contract";
import {success} from "@http4t/result";
import {JsonPathResult} from "@http4t/result/JsonPathResult";
import {ResponseLens} from "../routes";

export class NotFoundLens<T> implements ResponseLens<T | undefined> {
  constructor(private readonly lens: ResponseLens<T>) {
  }

  async get(message: HttpResponse): Promise<JsonPathResult<T | undefined>> {
    if (message.status === 404)
      return success(undefined)
    return await this.lens.get(message)
  }

  async set(value: T | undefined, message: HttpResponse): Promise<HttpResponse> {
    return typeof value === "undefined"
      ? {...message, status: 404}
      : await this.lens.set(value, message);
  }
}

export function maybe<T>(lens: ResponseLens<T>): NotFoundLens<T> {
  return new NotFoundLens(lens);
}