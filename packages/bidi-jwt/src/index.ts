import {MessageLens, routeFailed, RoutingResult} from "@http4t/bidi/lenses";
import {HttpMessage} from "@http4t/core/contract";
import {isFailure} from "@http4t/result";
import {text} from "@http4t/bidi/messages";
import {bearerAuthHeader} from "@http4t/bidi/lenses/BearerAuthHeader";
import {Routes} from "@http4t/bidi/routes";
import {mapped} from "@http4t/bidi/lenses/MapLens";
import {responseOf} from "@http4t/core/responses";
import {SecuredRoutesFor, serverSecuredRoutes} from "@http4t/bidi/auth/server";
import {AuthError} from "@http4t/bidi/lib/esm/auth/authError";

export type JwtString = string;
export type Jwt = { [k: string]: any };

export interface JwtStrategy {
    verify(token: string): Promise<RoutingResult<Jwt>>,

    sign(jwt: Jwt): Promise<JwtString>
}

/**
 * Typically used to e.g. set a jwt string as a request header and have it verified with getting on the server-side.
 */
export class GetJwtLens<TMessage extends HttpMessage = HttpMessage> implements MessageLens<TMessage, Jwt, JwtString> {
    constructor(private readonly tokenLens: MessageLens<TMessage, JwtString>,
                private readonly strategy: JwtStrategy) {
    }

    async get(from: TMessage): Promise<RoutingResult<Jwt>> {
        const result = await this.tokenLens.get(from);
        if (isFailure(result)) return result;
        try {
            return await this.strategy.verify(result.value);
        } catch (e: any) {
            return routeFailed(`Invalid jwt: '${e}'`, [], responseOf(401))
        }
    }

    async set<SetInto extends TMessage>(into: SetInto, value: JwtString): Promise<SetInto> {
        return this.tokenLens.set(into, value)
    }
}

/**
 * Typically used to e.g. send a jwt string back to the client in a response body.
 *
 * Server logic sets a Jwt without worrying about signing, client uses the returned string as an opaque token
 */
export class SetJwtLens<TMessage extends HttpMessage = HttpMessage> implements MessageLens<TMessage, JwtString, Jwt> {
    constructor(private readonly tokenLens: MessageLens<TMessage, JwtString>,
                private readonly strategy: JwtStrategy) {
    }

    async get(from: TMessage): Promise<RoutingResult<JwtString>> {
        return this.tokenLens.get(from);
    }

    async set<SetInto extends TMessage>(into: SetInto, value: Jwt): Promise<SetInto> {
        return this.tokenLens.set(into, await this.strategy.sign(value))
    }
}

export function jwtAuthHeader(strategy: JwtStrategy): MessageLens<HttpMessage, Jwt, JwtString> {
    return new GetJwtLens(bearerAuthHeader(), strategy);
}

export function jwtBody(strategy: JwtStrategy): MessageLens<HttpMessage, JwtString, Jwt> {
    return new SetJwtLens(text(), strategy);
}

export function jwtSecuredRoutes<TRoutes extends Routes, TClaims = Jwt, TAuthError = AuthError>(
    unsecuredRoutes: TRoutes,
    jwtStrategy: JwtStrategy,
    tokenToClaims: (token: Jwt) => Promise<RoutingResult<TClaims>>
): SecuredRoutesFor<TRoutes, string, TClaims, TAuthError> {

    const tokenLens: MessageLens<HttpMessage, TClaims, JwtString> = mapped<Jwt, TClaims, JwtString, JwtString>(
        jwtAuthHeader(jwtStrategy),
        tokenToClaims,
        async jwt => jwt);

    return serverSecuredRoutes(
        unsecuredRoutes,
        tokenLens);
}