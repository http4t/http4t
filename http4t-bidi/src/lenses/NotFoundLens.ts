import {HttpResponse} from "@http4t/core/contract";
import {success} from "@http4t/result";
import {ResponseLens, RoutingResult} from "../routes";

export class NotFoundLens<T> implements ResponseLens<T | undefined> {
  constructor(private readonly lens: ResponseLens<T>) {
  }

  async get(message: HttpResponse): Promise<RoutingResult<T | undefined>> {
    if (message.status === 404)
      return success(undefined)
    return await this.lens.get(message);
  }

  async set(into: HttpResponse, value: T): Promise<HttpResponse> {
    return typeof value === "undefined"
      ? {...into, status: 404}
      : await this.lens.set(into, value);
  }
}

export function maybe<T>(lens: ResponseLens<T>): NotFoundLens<T> {
  return new NotFoundLens(lens);
}