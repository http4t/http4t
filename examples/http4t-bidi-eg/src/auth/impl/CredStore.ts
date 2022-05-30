import {Result} from "@http4t/result";
import {Creds} from "../api";

export interface CredStore {
    save(creds: Creds): Promise<Result<string, void>>;

    check(creds: Creds): Promise<Result<string, void>>
}

