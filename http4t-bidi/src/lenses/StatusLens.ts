import {HttpResponse} from "@http4t/core/contract";
import {ResponseLens, RoutingResult, wrongRoute} from "../lenses";

export class StatusLens<T> implements ResponseLens<T> {
  constructor(private readonly status: number, private readonly lens: ResponseLens<T>) {
  }

  async get(message: HttpResponse): Promise<RoutingResult<T>> {
    if (message.status != this.status)
      return wrongRoute(`Status was not ${this.status}`)

    return await this.lens.get(message);
  }

  async set(into: HttpResponse, value: T): Promise<HttpResponse> {
    return this.lens.set({...into, status: this.status}, value);
  }
}

export function response<T>(status: number, lens: ResponseLens<T>): StatusLens<T> {
  return new StatusLens(status, lens);
}