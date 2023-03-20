import {RoutingResult} from "@http4t/bidi/lenses";
import {bearerAuthHeader} from "@http4t/bidi/lenses/BearerAuthHeader";
import {SecuredRoutes, securedRoutes} from "@http4t/bidi/auth";
import {tokenToClaimsRoutes} from "@http4t/bidi/auth/server";
import {isFailure} from "@http4t/result";
import {Routes} from "@http4t/bidi/routes";

export type JwtString = string;
export type JwtPayload = {
    /**
     * JWT Issuer - [RFC7519#section-4.1.1](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.1).
     */
    iss?: string

    /**
     * JWT Subject - [RFC7519#section-4.1.2](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.2).
     */
    sub?: string

    /**
     * JWT Audience [RFC7519#section-4.1.3](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.3).
     */
    aud?: string | string[]

    /**
     * JWT ID - [RFC7519#section-4.1.7](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.7).
     */
    jti?: string

    /**
     * JWT Not Before - [RFC7519#section-4.1.5](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.5).
     */
    nbf?: number

    /**
     * JWT Expiration Time - [RFC7519#section-4.1.4](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.4).
     */
    exp?: number

    /**
     * JWT Issued At - [RFC7519#section-4.1.6](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.6).
     */
    iat?: number

    [k: string]: unknown
};

export interface JwtStrategy {
    verify(token: string): Promise<RoutingResult<JwtPayload>>,

    sign(jwt: JwtPayload): Promise<JwtString>
}

export function jwtRoutes<TRoutes extends Routes>(
    unsecuredRoutes: TRoutes
): SecuredRoutes<TRoutes, JwtString> {

    return securedRoutes(
        unsecuredRoutes,
        bearerAuthHeader());
}

/**
 * For routes secured with a jwt string, maps each route to one
 */
export function serverSideJwtRoutes<TRoutes extends SecuredRoutes<TRoutes, JwtString>,
    TToken,
    TClaims = JwtPayload>(
    tokenSecuredRoutes: TRoutes,
    jwtStrategy: JwtStrategy,
    tokenToClaims: (token: JwtPayload) => Promise<RoutingResult<TClaims>>
): SecuredRoutes<TRoutes, TClaims> {

    return tokenToClaimsRoutes(
        tokenSecuredRoutes,
        async (token: JwtString) => {

            const verificationResult = await jwtStrategy.verify(token);

            if (isFailure(verificationResult)) return verificationResult;

            return tokenToClaims(verificationResult.value);
        });
}