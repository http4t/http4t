import {JwtPayload, JwtStrategy, JwtString} from "./index";
import {importPKCS8, importSPKI, jwtVerify, KeyLike, SignJWT} from "jose";
import {responseOf} from "@http4t/core/responses";
import {routeFailed, RoutingResult} from "@http4t/bidi/lenses";
import {success} from "@http4t/result";

export type ConfigureJose = (signer: SignJWT) => Promise<SignJWT> | SignJWT;

export class JoseJwtStrategy implements JwtStrategy {
    constructor(private readonly keys: Keys,
                private readonly configure: ConfigureJose) {

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
        const configuredSigner = await this.configure(signer);
        return await configuredSigner.sign(this.keys.privateKey);
    }
}

export type Keys = {
    publicKey: KeyLike | Uint8Array,
    privateKey: KeyLike | Uint8Array | undefined
};

export function serverJwt(keys: Keys,
                          configureJose: ConfigureJose): JwtStrategy {
    return new JoseJwtStrategy(keys, configureJose);
}

/**
 * A sensible default choice for a JWT strategy
 */
export async function ed25519(opts: { publicKey: string, privateKey: string, expirationTime: string, additionalConfig?: ConfigureJose }): Promise<JwtStrategy> {
    const configureJose: ConfigureJose = enc => {
        return enc
            .setProtectedHeader({typ: "JWT", alg: "Ed25519"})
            .setIssuedAt()
            .setExpirationTime(opts.expirationTime);
    };

    const publicKey = await importSPKI(opts.publicKey, "Ed25519");
    const privateKey = await importPKCS8(opts.privateKey, "Ed25519");

    return serverJwt(
        {publicKey, privateKey},
        async encrypt => {
            const configured = await configureJose(encrypt);
            return opts.additionalConfig
                ? await opts.additionalConfig(configured)
                : configured;
        });
}
