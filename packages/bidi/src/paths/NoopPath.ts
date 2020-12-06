import {success} from "@http4t/result";
import {PathMatcher, PathResult} from "./PathMatcher";

export class NoopPath implements PathMatcher<undefined> {
    consume(path: string): PathResult<undefined> {
        return success({
            value: undefined,
            remaining: path
        });
    }

    expand(_value: undefined): string {
        return "";
    }
}
