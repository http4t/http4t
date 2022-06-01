import {Jwt, JwtStrategy} from "./index";
import {decodeJwt, jwtVerify, KeyLike, SignJWT} from "jose";
import {responseOf} from "@http4t/core/responses";
import {routeFailed, RoutingResult} from "@http4t/bidi/lenses";
import {success} from "@http4t/result";

export class JoseClientJwtStrategy implements JwtStrategy {
    async verify(token: string): Promise<RoutingResult<Jwt>> {
        const decodedJwt = await decodeJwt(token);
        const jwt: Jwt = {payload: decodedJwt, originalToken: token};
        return success(jwt);
    }

    async sign(jwt: Jwt): Promise<string> {
        if (!jwt.originalToken) throw new Error(`JWT did not include originalToken field`);
        return jwt.originalToken;
    }
}

export type ConfigureSigner = (signer: SignJWT) => SignJWT;

export class JoseServerJwtStrategy implements JwtStrategy {
    constructor(private readonly keys: Keys,
                private readonly configure: ConfigureSigner) {

    }

    async verify(token: string): Promise<RoutingResult<Jwt>> {
        try {
            const joseResult = await jwtVerify(token, this.keys.publicKey);
            return success({payload: joseResult.payload, token});
        } catch (e: any) {
            return routeFailed(`Could not decrypt jwt: ${e}`, ["headers", "Authentication"], responseOf(403))
        }
    }

    async sign(jwt: Jwt): Promise<string> {
        if (typeof this.keys.privateKey === "undefined") throw new Error("No private key provided for signing jwts");
        const signer = new SignJWT(jwt.payload);
        return await this.configure(signer).sign(this.keys.privateKey);
    }
}

export function clientJwt(): JwtStrategy {
    return new JoseClientJwtStrategy();
}

export type Keys = {
    publicKey: KeyLike | Uint8Array,
    privateKey: KeyLike | Uint8Array | undefined
};

export function serverJwt(keys: Keys,
                          configureJose: (encrypt: SignJWT) => SignJWT): JwtStrategy {
    return new JoseServerJwtStrategy(keys, configureJose);
}
