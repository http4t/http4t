import {HttpRequest, Method} from "@http4t/core/contract";
import {success} from "@http4t/result";
import {RequestLens, RoutingResult, wrongRoute} from "../lenses";

/**
 * Injects method into request.
 *
 * Fails to extract if method is not correct.
 */
export class MethodLens implements RequestLens<undefined> {
    constructor(private readonly method: Method) {
    }

    async get(request: HttpRequest): Promise<RoutingResult<undefined>> {
        if (request.method.toUpperCase() === this.method.toUpperCase()) {
            return success(undefined);
        }
        return wrongRoute(`Method must be ${this.method}`);
    }

    async set(into: HttpRequest, value: undefined): Promise<HttpRequest> {
        return {...into, method: this.method};
    }
}
