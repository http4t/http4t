import {Result} from "@http4t/result";
import {Creds} from "@http4t/bidi-eg-client/auth";

export interface CredStore {
    save(creds: Creds): Promise<Result<string, void>>;

    check(creds: Creds): Promise<Result<string, void>>
}

