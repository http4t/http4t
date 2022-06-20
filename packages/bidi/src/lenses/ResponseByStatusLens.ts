import {HttpMessage, HttpResponse} from "@http4t/core/contract";
import {BaseResponseLens, MessageLens, ResponseLens, routeFailed, RoutingResult} from "../lenses";

export type LensesByStatus<T> = { [k: number]: MessageLens<HttpMessage, T> };

export class ResponseByStatusLens<T, TStatuses extends LensesByStatus<T>> extends BaseResponseLens<T> {
    private readonly allStatuses: number[];

    constructor(private readonly statuses: TStatuses,
                private readonly getStatus: (request: T) => keyof TStatuses) {
        super();
        this.allStatuses = Object.keys(this.statuses) as any;
    }

    async get(message: HttpResponse): Promise<RoutingResult<T>> {
        if (!this.statuses.hasOwnProperty(message.status))
            return routeFailed(this.allStatuses.length === 1
                ? `Status was not ${this.allStatuses[0]}`
                : `Status was not in ${this.allStatuses.join(", ")}`,
                ["status"]);

        const lens = this.statuses[message.status];
        return await lens.get(message);
    }


    async setResponse(into: HttpResponse, value: T): Promise<HttpResponse> {
        const status = this.getStatus(value);
        const lens: ResponseLens<T> = this.statuses[status] as any;
        if (!lens) throw new Error(`No lens provided for status ${String(status)}`);
        return lens.set({...into, status: status as number}, value);
    }
}

export function statuses<T, TStatuses extends LensesByStatus<T>>(statuses: TStatuses, getStatus: (value: T) => keyof TStatuses): ResponseLens<T> {
    return new ResponseByStatusLens(statuses, getStatus);
}
