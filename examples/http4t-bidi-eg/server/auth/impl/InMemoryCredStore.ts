import {failure, Result, success} from "@http4t/result";
import {CredStore} from "./CredStore";
import {Creds} from "@http4t/bidi-eg-client/auth";

export class InMemoryCredStore implements CredStore {
    private readonly creds: { [userName: string]: Creds } = {};

    async check(creds: Creds): Promise<Result<string, void>> {
        const {userName, password} = creds;
        const existingCreds = this.creds[userName];
        if (!existingCreds) return failure(`User '${userName}' does not exist`)
        if (existingCreds.password !== password) return failure("Wrong password");
        return success(undefined);

    }

    async save(creds: Creds): Promise<Result<string, void>> {
        const {userName} = creds;
        const existingCreds = this.creds[userName];
        if (existingCreds) return failure(`User '${userName}' already exists`)
        this.creds[userName] = creds;
        return success(undefined);
    }

}