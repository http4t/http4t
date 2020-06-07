import {HttpResponse} from "@http4t/core/contract";
import {isSuccess, success} from "@http4t/result";
import {failure, JsonPathResult} from "@http4t/result/JsonPathResult";
import {ResponseLens} from "../routes";

export type ByStatus = { [k: number]: any };
export type ResponsesByStatus<T extends ByStatus> = { [K in keyof T]: ResponseLens<T[K]> }
export type MatchedResponse<T extends ByStatus, K extends keyof T = keyof T> = { status: K, value: T[K] };

export class ResponseByStatusLens<T extends ByStatus> implements ResponseLens<MatchedResponse<T>> {
  constructor(private readonly statuses: ResponsesByStatus<T>) {
  }

  async extract(message: HttpResponse): Promise<JsonPathResult<MatchedResponse<T>>> {
    if (!this.statuses.hasOwnProperty(message.status))
      return failure(`Status was not in ${Object.keys(this.statuses)}`, ["status"])

    const result = await this.statuses[message.status].extract(message);
    return isSuccess(result)
      ? success({status: message.status, value: result.value})
      : result;
  }

  async inject(value: MatchedResponse<T>, message: HttpResponse): Promise<HttpResponse> {
    if (!this.statuses.hasOwnProperty(message.status))
      throw new Error(`No lens for status ${value.status}`);

    return this.statuses[value.status].inject(value.value, {...message, status: value.status as number});
  }
}

export function responses<T extends ByStatus>(byStatus: ResponsesByStatus<T>): ResponseByStatusLens<T> {
  return new ResponseByStatusLens(byStatus);
}