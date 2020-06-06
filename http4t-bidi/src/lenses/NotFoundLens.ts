import {HttpResponse} from "@http4t/core/contract";
import {Result, success} from "@http4t/result";
import {ResponseLens} from "../routes";

export class NotFoundLens<T> implements ResponseLens<T | undefined> {
  constructor(private readonly lens: ResponseLens<T>) {
  }

  async extract(message: HttpResponse): Promise<Result<T | undefined>> {
    if (message.status === 404)
      return success(undefined)
    return await this.lens.extract(message)
  }

  async inject(value: T | undefined, message: HttpResponse): Promise<HttpResponse> {
    return typeof value === "undefined"
      ? {...message, status: 404}
      : await this.lens.inject(value, message);
  }
}

export function maybe<T>(lens: ResponseLens<T>): NotFoundLens<T> {
  return new NotFoundLens(lens);
}