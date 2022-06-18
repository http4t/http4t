import {isFailure, Result, success} from "@http4t/result";
import {JwtPayload, JwtStrategy} from "@http4t/bidi-jwt";
import {AuthServer, User} from "./api";
import {CredStore} from "./impl/CredStore";

export type AuthOpts = { creds: CredStore, jwt: JwtStrategy };

export function authLogic(opts: AuthOpts): AuthServer {
    const {creds, jwt} = opts;
    return {
        async login(request: { userName: string; password: string }): Promise<Result<string, JwtPayload>> {
            const result = await creds.check(request);
            if (isFailure(result)) return result;
            const userJwt = {payload: {userName: request.userName}};
            const token = await jwt.sign(userJwt);
            return success({originalToken: token, ...userJwt})

        },
        async register(request: { userName: string; password: string }): Promise<Result<string, User>> {
            const result = await creds.save(request);
            if (isFailure(result)) return result;
            return success({userName: request.userName})
        }
    };
}