import {ParsedUri} from "@http4t/core/contract";
import {joinPaths, stripSlashes} from "@http4t/core/uri";
import {isFailure, success} from "@http4t/result";
import {failure, JsonPathResult, prefix} from "@http4t/result/JsonPathResult";
import {PathMatcher} from "../paths/PathMatcher";
import {BiDiLens} from "../routes";

export class UriLens<T> implements BiDiLens<T, ParsedUri> {
  constructor(private readonly path: PathMatcher<T>) {
  }

  async extract(uri: ParsedUri): Promise<JsonPathResult<T>> {
    const result = this.path.consume(uri.path);

    if (isFailure(result))
      return prefix(result, ["path"]);

    if (stripSlashes(result.value.remaining).length !== 0)
      return failure(`Path did not fully match uri. Remaining: "${result.value.remaining}"`, ["path"]);

    return success(result.value.value as T);
  }

  async inject(value: T, uri: ParsedUri): Promise<ParsedUri> {
    return {...uri, path: joinPaths(uri.path, this.path.expand(value))};
  }
}

