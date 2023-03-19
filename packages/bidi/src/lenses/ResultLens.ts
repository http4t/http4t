import {BaseResponseLens, ResponseLens, ROUTE_FAILED, RoutingResult} from "../lenses";
import {failure, isFailure, isSuccess, Result, success} from "@http4t/result";
import {HttpResponse} from "@http4t/core/contract";
import {prefixProducedBy} from "@http4t/result/JsonPathResult";
import {responseOf} from "@http4t/core/responses";
import {typeDescription} from "@http4t/core/bodies";


export class ResultLens<E = unknown, T = unknown> extends BaseResponseLens<Result<E, T>> {
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
        if (isSuccess(value)) {
            return this.success.set(into, value.value);
        } else {
            if (!isFailure(value))
                throw new Error(`Expected a Result but got ${value} (${typeDescription(value)})`);
            return this.failure.set(into, value.error);
        }
    }

}

export function result<E = unknown, T = unknown>(
    failure: ResponseLens<E>,
    success: ResponseLens<T>): ResponseLens<Result<E, T>> {
    return new ResultLens(failure, success);
}
