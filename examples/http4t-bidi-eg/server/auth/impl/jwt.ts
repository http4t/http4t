import {JwtPayload, JwtStrategy} from "@http4t/bidi-jwt";
import {TotallyInsecureServerJwtStrategy} from "@http4t/bidi-jwt/testing";
import {assertExhaustive} from "@http4t/core/util/assertExhaustive";
import {routeFailed, RoutingResult} from "@http4t/bidi/lenses";
import {DocStoreClaims} from "@http4t/bidi-eg-client/auth";
import {success} from "@http4t/result";
import {AuthConfig} from "../../config";
import {ed25519} from "@http4t/bidi-jwt/jose";

export async function jwtStrategy(auth: AuthConfig): Promise<JwtStrategy> {
    const authType = auth.type;

    switch (authType) {
        case "secure":
            return await ed25519({
                ...auth,
                expirationTime: '8h'
            });
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