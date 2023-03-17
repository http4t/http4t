import {BaseResponseLens, ResponseLens, ROUTE_FAILED, RoutingResult} from "../lenses";
import {failure, isFailure, isSuccess, Result, success} from "@http4t/result";
import {HttpResponse} from "@http4t/core/contract";
import {prefixProducedBy} from "@http4t/result/JsonPathResult";
import {responseOf} from "@http4t/core/responses";
import {typeDescription} from "@http4t/core/bodies";


export class ResultLens<EServer, TServer, EClient = EServer, TClient = TServer> extends BaseResponseLens<Result<EClient, TClient>, Result<EServer, TServer>> {
    constructor(private readonly failure: ResponseLens<EClient, EServer>,
                private readonly success: ResponseLens<TClient, TServer>) {
        super();
    }

    async get(from: HttpResponse): Promise<RoutingResult<Result<EClient, TClient>>> {
        const s: RoutingResult<TClient> = await this.success.get(from);
        if (isSuccess(s)) return success(s);
        const f: RoutingResult<EClient> = await this.failure.get(from);
        if (isSuccess(f)) return success(failure(f.value))

        return failure({
            type: ROUTE_FAILED,
            problems: [
                ...prefixProducedBy(s.error.problems, "success"),
                ...prefixProducedBy(f.error.problems, "failure")],
            response: responseOf(500)
        });
    }

    async setResponse(into: HttpResponse, value: Result<EServer, TServer>): Promise<HttpResponse> {
        if (isSuccess(value)) {
            return this.success.set(into, value.value);
        } else {
            if (!isFailure(value))
                throw new Error(`Expected a Result but got ${value} (${typeDescription(value)})`);
            return this.failure.set(into, value.error);
        }
    }

}

export function result<EServer, TServer, EClient = EServer, TClient = TServer>(
    failure: ResponseLens<EClient, EServer>,
    success: ResponseLens<TClient, TServer>): ResponseLens<Result<EClient, TClient>, Result<EServer, TServer>> {
    return new ResultLens(failure, success);
}
