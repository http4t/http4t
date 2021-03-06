import {HttpRequest, HttpResponse} from "@http4t/core/contract";

export type ErrorResponder = (request: HttpRequest, err: any) => Promise<HttpResponse & { err: any }>
export const badGateway: ErrorResponder =
    async (request, err) => {
        return {
            status: 502,
            headers: [],
            body: "Problem in @http4t/chrome-extension content page: " + (err.message || JSON.stringify(err)),
            err
        };
    }
