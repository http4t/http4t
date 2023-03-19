import {isFailure, Result, success} from "@http4t/result";
import {JwtStrategy, JwtString} from "@http4t/bidi-jwt";
import {CredentialRepository} from "./impl/CredentialRepository";
import {Auth, User} from "@http4t/bidi-eg-client/auth";

export type AuthOpts = { creds: CredentialRepository, jwt: JwtStrategy };

export function authLogic(opts: AuthOpts): Auth {
    const {creds, jwt} = opts;
    return {
        async login(request: { userName: string; password: string }): Promise<Result<string, JwtString>> {
            const result = await creds.check(request);
            if (isFailure(result)) return result;
            const userJwt = {payload: {userName: request.userName}};
            const token = await jwt.sign(userJwt);
            return success(token);

        },
        async register(request: { userName: string; password: string }): Promise<Result<string, User>> {
            const result = await creds.save(request);
            if (isFailure(result)) return result;
            return success({userName: request.userName})
        }
    };
}