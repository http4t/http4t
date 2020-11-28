import {HttpResponse} from "@http4t/core/contract";
import {responseOf} from "@http4t/core/responses";
import {success} from "@http4t/result";
import {ResponseLens, routeFailed, RoutingResult} from "../lenses";

export class NotFoundLens<T> implements ResponseLens<T | undefined> {
    constructor(private readonly lens: ResponseLens<T>, private readonly expectedStatus: number) {
        if (expectedStatus === 404) {
            throw new Error(``);
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

    async set(into: HttpResponse, value: T): Promise<HttpResponse> {
        return typeof value === "undefined"
            ? {...into, status: 404}
            : await this.lens.set(into, value);
    }
}

export function maybe<T>(lens: ResponseLens<T>, {expectedStatus = 200}: { expectedStatus?: number } = {}): NotFoundLens<T> {
    return new NotFoundLens(lens, expectedStatus);
}
