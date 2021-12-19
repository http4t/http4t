import {ResponseLens, routeFailed, RoutingResult} from "../lenses";
import {failure, isSuccess, map, Result, success} from "@http4t/result";
import {HttpResponse} from "@http4t/core/contract";
import {json} from "./JsonLens";


export class ResultLens<E, T> implements ResponseLens<Result<E, T>> {
    constructor(private readonly successStatus: number,
                private readonly success: ResponseLens<T>,
                private readonly failureStatus: number,
                private readonly failure: ResponseLens<E>) {
    }

    async get(from: HttpResponse): Promise<RoutingResult<Result<E, T>>> {
        switch (from.status) {
            case this.successStatus :
                return map(await this.success.get(from), v => success(v));
            case this.failureStatus:
                return map(await this.failure.get(from), v => failure(v));
            default:
                return routeFailed(`Status was neither ${this.successStatus} nor ${this.failureStatus}`, ['status'])
        }
    }

    async set(into: HttpResponse, value: Result<E, T>): Promise<HttpResponse> {
        return isSuccess(value)
            ? this.success.set({...into, status: this.successStatus}, value.value)
            : this.failure.set({...into, status: this.failureStatus}, value.error);
    }

}

export function result<E, T>(success: ResponseLens<T> = json(), failure: ResponseLens<E> = json(), failureStatus: number = 400, successStatus: number = 200) {
    return new ResultLens(successStatus, success, failureStatus, failure);
}

export function unauthorisedResult<E, T>(success: ResponseLens<T> = json(), failure: ResponseLens<E> = json(), successStatus: number = 200) {
    return new ResultLens(successStatus, success, 403, failure);
}