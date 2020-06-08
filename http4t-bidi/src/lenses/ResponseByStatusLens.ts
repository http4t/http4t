import {HttpResponse} from "@http4t/core/contract";
import {isSuccess, success} from "@http4t/result";
import {ResponseLens, RoutingResult, wrongRoute} from "../lenses";

export type ByStatus = { [k: number]: any };
export type ResponsesByStatus<T extends ByStatus> = { [K in keyof T]: ResponseLens<T[K]> }
export type MatchedResponse<T extends ByStatus, K extends keyof T = keyof T> = { status: K, value: T[K] };

export class ResponseByStatusLens<T extends ByStatus> implements ResponseLens<MatchedResponse<T>> {
  constructor(private readonly statuses: ResponsesByStatus<T>) {
  }

  async get(message: HttpResponse): Promise<RoutingResult<MatchedResponse<T>>> {
    if (!this.statuses.hasOwnProperty(message.status))
      return wrongRoute(`Status was not in ${Object.keys(this.statuses)}`);

    const result = await this.statuses[message.status].get(message);
    return isSuccess(result)
      ? success({status: message.status, value: result.value})
      : result;
  }

  async set(into: HttpResponse, value: MatchedResponse<T>): Promise<HttpResponse> {
    if (!this.statuses.hasOwnProperty(into.status))
      throw new Error(`No lens for status ${value.status}`);

    return this.statuses[value.status].set({...into, status: value.status as number}, value.value);
  }
}

export function responses<T extends ByStatus>(byStatus: ResponsesByStatus<T>): ResponseByStatusLens<T> {
  return new ResponseByStatusLens(byStatus);
}