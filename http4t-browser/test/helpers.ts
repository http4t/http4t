import {HttpRequest} from "@http4t/core/contract";
import {Filter, filterRequest} from "@http4t/core/Filter";

export function toHttpBin(scheme: string): Filter {
    return filterRequest((request: HttpRequest): HttpRequest => {
        return {
            ...request,
            uri: {
                ...request.uri,
                scheme: scheme,
                authority: {
                    ...request.uri.authority,
                    host: "httpbin.org"
                }
            }
        }
    })
}
