import {HttpResponse} from "@http4t/core/contract";
import {responseOf} from "@http4t/core/responses";
import {success} from "@http4t/result";
import {BaseResponseLens, ResponseLens, routeFailed, RoutingResult} from "../lenses";

export class OrNotFoundLens<T> extends BaseResponseLens<T | undefined> {
    constructor(private readonly lens: ResponseLens<T>,
                private readonly expectedStatus: number) {
        super();
        if (expectedStatus === 404) {
            throw new Error("Expected status of successful response cannot _also_ be 404");
        }
    }

    async get(message: HttpResponse): Promise<RoutingResult<T | undefined>> {
        if (message.status === 404) {
            return success(undefined)
        } else if (message.status === this.expectedStatus) {
            return await this.lens.get(message);
        } else {
            return routeFailed(`Expected status ${this.expectedStatus}`, ["status"], responseOf(500))
        }
    }

    async setResponse(into: HttpResponse, value: T | undefined): Promise<HttpResponse> {
        return typeof value === "undefined"
            ? {...into, status: 404}
            : await this.lens.set({...into, status: this.expectedStatus}, value);
    }
}

export function orNotFound<T>(lens: ResponseLens<Exclude<T, undefined>>, {expectedStatus = 200}: { expectedStatus?: number } = {}): ResponseLens<T | undefined> {
    return new OrNotFoundLens(lens, expectedStatus);
}
