import {MessageLens, routeFailed, RoutingResult} from "@http4t/bidi/lenses";
import {HttpMessage} from "@http4t/core/contract";
import {isFailure} from "@http4t/result";
import {text} from "@http4t/bidi/messages";
import {bearerAuthHeader} from "@http4t/bidi/lenses/BearerAuthHeader";
import {Routes} from "@http4t/bidi/routes";
import {mapped} from "@http4t/bidi/lenses/MapLens";
import {responseOf} from "@http4t/core/responses";
import {SecuredRoutesFor, serverSecuredRoutes} from "@http4t/bidi/auth/server";

export type Jwt = {
    originalToken?: string
    payload: { [k: string]: any }
}

export interface JwtStrategy {
    verify(token: string): Promise<RoutingResult<Jwt>>,

    sign(jwt: Jwt): Promise<string>
}

export class JwtLens<TMessage extends HttpMessage = HttpMessage> implements MessageLens<TMessage, Jwt> {
    constructor(private readonly tokenLens: MessageLens<TMessage, string>,
                private readonly strategy: JwtStrategy) {
    }

    async get(from: TMessage): Promise<RoutingResult<Jwt>> {
        const result = await this.tokenLens.get(from);
        if (isFailure(result)) return result;
        try {
            return await this.strategy.verify(result.value);
        } catch (e) {
            return routeFailed(`Invalid jwt: '${e}'`, [], responseOf(401))
        }
    }

    async set<SetInto extends TMessage>(into: SetInto, value: Jwt): Promise<SetInto> {
        return this.tokenLens.set(into, await this.strategy.sign(value))
    }
}

export function jwt<TMessage extends HttpMessage = HttpMessage>(
    tokenLens: MessageLens<TMessage, string>,
    strategy: JwtStrategy): MessageLens<TMessage, Jwt> {
    return new JwtLens(tokenLens, strategy);
}

export function jwtAuthHeader(strategy: JwtStrategy): MessageLens<HttpMessage, Jwt> {
    return jwt(bearerAuthHeader(), strategy);
}

export function jwtBody(strategy: JwtStrategy): MessageLens<HttpMessage, Jwt> {
    return jwt(text(), strategy);
}

export function jwtSecuredRoutes<TRoutes extends Routes, TClaims, TAuthError>(
    unsecuredRoutes: TRoutes,
    jwtStrategy: JwtStrategy,
    tokenToClaims: (token: Jwt) => Promise<RoutingResult<TClaims>>
): SecuredRoutesFor<TRoutes, Jwt, TClaims, TAuthError> {

    const tokenLens: MessageLens<HttpMessage, TClaims, Jwt> = mapped<Jwt, TClaims, Jwt, Jwt>(
        jwtAuthHeader(jwtStrategy),
        tokenToClaims,
        async jwt => jwt);

    return serverSecuredRoutes(
        unsecuredRoutes,
        tokenLens);
}