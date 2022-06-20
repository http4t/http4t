import {MessageLens, routeFailed, RoutingResult} from "@http4t/bidi/lenses";
import {HttpMessage} from "@http4t/core/contract";
import {text} from "@http4t/bidi/messages";
import {bearerAuthHeader} from "@http4t/bidi/lenses/BearerAuthHeader";
import {Routes} from "@http4t/bidi/routes";
import {SecuredRoutesFor, serverSecuredRoutes, TokenToClaims} from "@http4t/bidi/auth/server";
import {AuthError} from "@http4t/bidi/auth/authError";
import {isFailure} from "@http4t/result";
import {responseOf} from "@http4t/core/responses";

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

/**
 * Typically used to e.g. set a jwt string as a request header and have it verified with getting on the server-side.
 *
 */
export class GetJwtLens<TMessage extends HttpMessage = HttpMessage> implements MessageLens<TMessage, JwtPayload> {
    /**
     * @param tokenLens typically {@link bearerAuthHeader}
     * @param strategy
     */
    constructor(private readonly tokenLens: MessageLens<TMessage, JwtString>,
                private readonly strategy: JwtStrategy) {
    }

    async get(from: TMessage): Promise<RoutingResult<JwtPayload>> {
        const result = await this.tokenLens.get(from);
        if (isFailure(result)) return result;
        try {
            return await this.strategy.verify(result.value);
        } catch (e: any) {
            return routeFailed(`Invalid jwt: '${e}'`, [], responseOf(401))
        }
    }

    async set<SetInto extends TMessage>(into: SetInto, value: JwtPayload): Promise<SetInto> {
        throw new Error(GetJwtLens.name + " should not be used client-side")
    }
}

export function verifyJwt<TMessage extends HttpMessage = HttpMessage>(
    tokenLens: MessageLens<TMessage, JwtString>,
    strategy: JwtStrategy
): MessageLens<TMessage, JwtPayload> {
    return new GetJwtLens(tokenLens, strategy);
}

export function jwtBody(): MessageLens<HttpMessage, JwtString> {
    return text();
}

export function jwtSecuredRoutes<TRoutes extends Routes, TClaims = JwtPayload, TAuthError = AuthError>(
    unsecuredRoutes: TRoutes,
    jwtStrategy: JwtStrategy,
    jwtToClaims: TokenToClaims<JwtPayload, TClaims>
): SecuredRoutesFor<TRoutes, TClaims, TAuthError> {

    return serverSecuredRoutes(
        unsecuredRoutes,
        verifyJwt(bearerAuthHeader(), jwtStrategy),
        jwtToClaims);
}