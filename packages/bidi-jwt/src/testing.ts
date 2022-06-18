import {JwtPayload, JwtStrategy} from "./index";
import {routeFailed, RoutingResult} from "@http4t/bidi/lenses";
import {base64url, decodeJwt} from "jose";
import {success} from "@http4t/result";
import {responseOf} from "@http4t/core/responses";

/**
 * Useful in testing where you don't want to overhead of encryption
 */
export class TotallyInsecureServerJwtStrategy implements JwtStrategy {
    constructor(private readonly expectedSignature: string) {

    }

    async verify(token: string): Promise<RoutingResult<JwtPayload>> {
        if (token.split('.')[2] !== this.expectedSignature)
            return routeFailed(`Could not verify jwt`, ["headers", "Authentication"], responseOf(403))
        const decodedJwt = await decodeJwt(token);
        return success({payload: decodedJwt, token});
    }

    async sign(jwt: JwtPayload): Promise<string> {
        const header = base64url.encode(JSON.stringify({alg: 'none'}))
        const payload = base64url.encode(JSON.stringify(jwt.payload))

        return `${header}.${payload}.${this.expectedSignature}`
    }
}

export function totallyInsecureServerJwtStrategy(expectedSignature: string): JwtStrategy {
    return new TotallyInsecureServerJwtStrategy(expectedSignature);
}