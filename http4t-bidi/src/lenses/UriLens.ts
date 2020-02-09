import {ParsedUri} from "@http4t/core/contract";
import {joinPaths, stripSlashes} from "@http4t/core/uri";
import {failure, Result, success} from "@http4t/result";
import {PathMatcher} from "../paths";
import {BiDiLens} from "../routes";

export class UriLens<T> implements BiDiLens<T, ParsedUri> {
  constructor(private readonly path: PathMatcher<T>) {
  }

  async extract(uri: ParsedUri): Promise<Result<T>> {
    const result = this.path.consume(uri.path);

    if (!result)
      return failure("Path did not match", ["path"]);

    if (stripSlashes(result.remaining).length !== 0)
      return failure(`Path did not fully match uri. Remaining: "${result.remaining}"`, ["path"]);

    return success(result.value as T);
  }

  async inject(value: T, uri: ParsedUri): Promise<ParsedUri> {
    return {...uri, path: joinPaths(uri.path, this.path.expand(value))};
  }
}

