import {JwtStrategy} from "@http4t/bidi-jwt";
import {TotallyInsecureServerJwtStrategy} from "@http4t/bidi-jwt/testing";
import {ConfigureSigner, serverJwt} from "@http4t/bidi-jwt/jose";
import {importPKCS8, importSPKI} from "jose";
import {AuthConfig, SecureAuthConfig} from "../../docStoreRouter";

async function secureJwtStrategy(auth: SecureAuthConfig) {
    const configureJose: ConfigureSigner = enc => {
        return enc
            .setProtectedHeader({typ: "JWT", alg: "Ed25519"})
            .setIssuedAt()
            .setExpirationTime('8h');
    };

    const publicKey = await importSPKI(auth.publicKey, "Ed25519");
    const privateKey = await importPKCS8(auth.privateKey, "Ed25519");
    return serverJwt(
        {publicKey, privateKey},
        configureJose);
}

export async function jwtStrategy(auth: AuthConfig): Promise<JwtStrategy> {
    switch (auth.type) {
        case "secure":
            return await secureJwtStrategy(auth);
        case "insecure":
            return new TotallyInsecureServerJwtStrategy(auth.expectedSignature)
        default:
            return "exhaustive check" as never;
    }
}