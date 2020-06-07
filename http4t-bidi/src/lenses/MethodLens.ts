import {HttpRequest, Method} from "@http4t/core/contract";
import {success} from "@http4t/result";
import {failure, JsonPathResult} from "@http4t/result/JsonPathResult";
import {RequestLens} from "../routes";

/**
 * Injects method into request.
 *
 * Fails to extract if method is not correct.
 */
export class MethodLens implements RequestLens<void> {
  constructor(private readonly method: Method) {
  }

  async get(request: HttpRequest): Promise<JsonPathResult<void>> {
    if (request.method.toUpperCase() === this.method.toUpperCase()) {
      return success(undefined);
    }
    return failure(`Method must be ${this.method}`, ["method"]);
  }

  async set(into: HttpRequest, value: void): Promise<HttpRequest> {
    return {...into, method: this.method};
  }
}
