import {HttpRequest} from "@http4t/core/contract";
import {uri} from "@http4t/core/requests";
import {stripSlashes} from "@http4t/core/uri";
import {isSuccess, success} from "@http4t/result";
import {BaseRequestLens, RoutingResult, wrongRoute} from "../lenses";
import {PathMatcher} from "../paths/PathMatcher";

export class PathLens<T = unknown> extends BaseRequestLens<T> {
    constructor(readonly path: PathMatcher<T>) {
        super();
    }

    async get(request: HttpRequest): Promise<RoutingResult<T>> {
        const result = await this.path.consume(uri(request).path);

        return isSuccess(result)
            ? stripSlashes(result.value.remaining).length === 0
                ? success(result.value.value)
                : wrongRoute(`Did not match full path. Remaining path: "${result.value.remaining}"`, ["uri", "path"])
            : wrongRoute(`${result.error.message}. Remaining path: "${result.error.remaining}"`, ["uri", "path"]);
    }

    async setRequest(into: HttpRequest, value: T): Promise<HttpRequest> {
        const path = await this.path.expand(value);
        return {...into, uri: {...uri(into), path}};
    }

}