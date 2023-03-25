import {JwtPayload, JwtStrategy} from "@http4t/bidi-jwt";
import {TotallyInsecureServerJwtStrategy} from "@http4t/bidi-jwt/testing";
import {ConfigureSigner, serverJwt} from "@http4t/bidi-jwt/jose";
import {importPKCS8, importSPKI} from "jose";
import {assertExhaustive} from "@http4t/core/util/assertExhaustive";
import {routeFailed, RoutingResult} from "@http4t/bidi/lenses";
import {DocStoreClaims} from "@http4t/bidi-eg-client/auth";
import {success} from "@http4t/result";
import {AuthConfig, SecureAuthConfig} from "../../config";

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
    const authType = auth.type;

    switch (authType) {
        case "secure":
            return await secureJwtStrategy(auth);
        case "insecure":
            return new TotallyInsecureServerJwtStrategy(auth.expectedSignature)
        default:
            return assertExhaustive(authType);
    }
}

export async function jwtToOurClaims(jwt: JwtPayload): Promise<RoutingResult<DocStoreClaims>> {
    const userName = jwt["userName"] as string;
    if (!userName) return routeFailed("JWT did not contain 'userName'", ["headers", "Authorization"]);
    return success({
        principal: {
            type: "user",
            userName: userName
        }
    })
}