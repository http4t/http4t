import {JwtPayload, JwtStrategy, JwtString} from "./index";
import {jwtVerify, KeyLike, SignJWT} from "jose";
import {responseOf} from "@http4t/core/responses";
import {routeFailed, RoutingResult} from "@http4t/bidi/lenses";
import {success} from "@http4t/result";

export type ConfigureSigner = (signer: SignJWT) => SignJWT;

export class JoseJwtStrategy implements JwtStrategy {
    constructor(private readonly keys: Keys,
                private readonly configure: ConfigureSigner) {

    }

    async verify(token: string): Promise<RoutingResult<JwtPayload>> {
        try {
            const joseResult = await jwtVerify(token, this.keys.publicKey);
            return success(joseResult.payload);
        } catch (e: any) {
            return routeFailed(`Could not decrypt jwt: ${e}`, ["headers", "Authentication"], responseOf(403))
        }
    }

    async sign(jwt: JwtPayload): Promise<JwtString> {
        if (typeof this.keys.privateKey === "undefined") throw new Error("No private key provided for signing jwts");
        const signer = new SignJWT(jwt);
        return await this.configure(signer).sign(this.keys.privateKey);
    }
}

export type Keys = {
    publicKey: KeyLike | Uint8Array,
    privateKey: KeyLike | Uint8Array | undefined
};

export function serverJwt(keys: Keys,
                          configureJose: (encrypt: SignJWT) => SignJWT): JwtStrategy {
    return new JoseJwtStrategy(keys, configureJose);
}
