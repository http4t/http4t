import {Creds} from "../api";
import {Result} from "@http4t/result";

export interface CredStore {
    save(creds: Creds): Promise<Result<string, void>>;

    check(creds: Creds): Promise<Result<string, void>>
}

