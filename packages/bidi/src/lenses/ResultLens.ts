import {BaseResponseLens, ResponseLens, ROUTE_FAILED, RoutingResult} from "../lenses";
import {failure, isSuccess, Result, success} from "@http4t/result";
import {HttpResponse} from "@http4t/core/contract";
import {prefixProducedBy} from "@http4t/result/JsonPathResult";
import {responseOf} from "@http4t/core/responses";


export class ResultLens<E, T> extends BaseResponseLens<Result<E, T>> {
    constructor(private readonly failure: ResponseLens<E>,
                private readonly success: ResponseLens<T>) {
        super();
    }

    async get(from: HttpResponse): Promise<RoutingResult<Result<E, T>>> {
        const s: RoutingResult<T> = await this.success.get(from);
        if (isSuccess(s)) return success(s);
        const f: RoutingResult<E> = await this.failure.get(from);
        if (isSuccess(f)) return success(failure(f.value))

        return failure({
            type: ROUTE_FAILED,
            problems: [
                ...prefixProducedBy(s.error.problems, "success"),
                ...prefixProducedBy(f.error.problems, "failure")],
            response: responseOf(500)
        });
    }

    async setResponse(into: HttpResponse, value: Result<E, T>): Promise<HttpResponse> {
        return isSuccess(value)
            ? this.success.set(into, value.value)
            : this.failure.set(into, value.error);
    }

}

export function result<E, T>(
    failure: ResponseLens<E>,
    success: ResponseLens<T>): ResponseLens<Result<E, T>> {
    return new ResultLens(failure, success);
}
