import {failure, Result, success} from "@http4t/result";
import {CredentialRepository} from "./CredentialRepository";
import {Credentials} from "@http4t/bidi-eg-client/auth";

export class InMemoryCredentialRepository implements CredentialRepository {
    private readonly creds: { [userName: string]: Credentials } = {};

    async check(creds: Credentials): Promise<Result<string, void>> {
        const {userName, password} = creds;
        const existingCreds = this.creds[userName];
        if (!existingCreds) return failure(`User '${userName}' does not exist`)
        if (existingCreds.password !== password) return failure("Wrong password");
        return success(undefined);

    }

    async save(creds: Credentials): Promise<Result<string, void>> {
        const {userName} = creds;
        const existingCreds = this.creds[userName];
        if (existingCreds) return failure(`User '${userName}' already exists`)
        this.creds[userName] = creds;
        return success(undefined);
    }

}