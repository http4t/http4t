import {HttpMessage, HttpResponse} from "@http4t/core/contract";
import {BaseResponseLens, MessageLens, ResponseLens, routeFailed, RoutingResult} from "../lenses";

export type LensesByStatus<TGet, TSet> = { [k: number]: MessageLens<HttpMessage, TGet, TSet> };

export class ResponseByStatusLens<TGet, TStatuses extends LensesByStatus<TGet, TSet>, TSet = TGet> extends BaseResponseLens<TGet, TSet> {
    private readonly allStatuses: number[];

    constructor(private readonly statuses: TStatuses,
                private readonly getStatus: (request: TSet) => keyof TStatuses) {
        super();
        this.allStatuses = Object.keys(this.statuses) as any;
    }

    async get(message: HttpResponse): Promise<RoutingResult<TGet>> {
        if (!this.statuses.hasOwnProperty(message.status))
            return routeFailed(this.allStatuses.length === 1
                ? `Status was not ${this.allStatuses[0]}`
                : `Status was not in ${this.allStatuses.join(", ")}`,
                ["status"]);

        const lens = this.statuses[message.status];
        return await lens.get(message);
    }


    async setResponse(into: HttpResponse, value: TSet): Promise<HttpResponse> {
        const status = this.getStatus(value);
        const lens: ResponseLens<TSet> = this.statuses[status] as any;
        if (!lens) throw new Error(`No lens provided for status ${String(status)}`);
        return lens.set({...into, status: status as number}, value);
    }
}

export function statuses<TGet, TStatuses extends LensesByStatus<TGet, TSet>, TSet = TGet>(statuses: TStatuses, getStatus: (value: TSet) => keyof TStatuses): ResponseLens<TGet, TSet> {
    return new ResponseByStatusLens(statuses, getStatus);
}
