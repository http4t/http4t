import {Result} from "@http4t/result";
import {Credentials} from "@http4t/bidi-eg-client/auth";

export interface CredentialRepository {
    save(creds: Credentials): Promise<Result<string, void>>;

    check(creds: Credentials): Promise<Result<string, void>>
}

