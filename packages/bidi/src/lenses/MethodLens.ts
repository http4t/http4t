import {HttpRequest, Method} from "@http4t/core/contract";
import {success} from "@http4t/result";
import {BaseRequestLens, RequestLens, RoutingResult, wrongRouteError} from "../lenses";
import {value} from "./StaticValueLens";

/**
 * Note- method is normalised to uppercase when extracting
 */
export class MethodLens extends BaseRequestLens<Method> {
    async get(request: HttpRequest): Promise<RoutingResult<Method>> {
        return success(request.method.toUpperCase());
    }

    async setRequest(into: HttpRequest, value: Method): Promise<HttpRequest> {
        return {...into, method: value};
    }
}

export function method(): RequestLens<Method> {
    return new MethodLens();
}

export function expectMethod(expected: Method): RequestLens<undefined> {
    return value(
        expected,
        method(),
        {failure: actual => wrongRouteError(`Expected method ${expected} but was ${actual}`, ["method"])})
}