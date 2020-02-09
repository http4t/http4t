import {HttpRequest, Method} from "@http4t/core/contract";
import {failure, Result, success} from "@http4t/result";
import {RequestLens} from "../routes";

/**
 * Injects method into request.
 *
 * Fails to extract if method is not correct.
 */
export class MethodLens implements RequestLens<{}> {
  constructor(private readonly method: Method) {
  }

  async extract(request: HttpRequest): Promise<Result<{}>> {
    if (request.method.toUpperCase() === this.method.toUpperCase()) {
      return success({});
    }
    return failure(`Method must be ${this.method}`);
  }

  async inject(value: {}, message: HttpRequest): Promise<HttpRequest> {
    return {...message, method: this.method};
  }
}
