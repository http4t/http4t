import {HttpRequest, Method} from "@http4t/core/contract";
import {failure, Result, success} from "@http4t/result";
import {RequestLens} from "../routes";

/**
 * Injects method into request.
 *
 * Fails to extract if method is not correct.
 */
export class MethodLens implements RequestLens<void> {
  constructor(private readonly method: Method) {
  }

  async extract(request: HttpRequest): Promise<Result<void>> {
    if (request.method.toUpperCase() === this.method.toUpperCase()) {
      return success(undefined);
    }
    return failure(`Method must be ${this.method}`, ["method"]);
  }

  async inject(value: void, message: HttpRequest): Promise<HttpRequest> {
    return {...message, method: this.method};
  }
}
