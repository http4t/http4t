import {HandlerFn1} from "../routes";

/**
 * A value (usually message payload) along with some security context.
 *
 * For example, `TSecurity` might be a token/key on the client-side, and some claims derived from a token/key on the server side.
 */
export type WithSecurity<T, TSecurity> = {
    security: TSecurity
    value: T
}

export type UnsecuredFn<THandler> = THandler extends HandlerFn1<WithSecurity<infer In, infer TSecurity>,
        infer Out>

    ? (req: In) => Promise<Out>

    : never;

/**
 * For `TApi` where each method takes a parameter of `WithSecurity<T,TSecurity>`, maps each function to take `T`
 *
 * ```typescript
 * // For interface:
 *
 * interface MySecuredApi {
 *     post(request: WithSecurity<Doc, MyClaims>): Promise<Result<AuthError, { id: string }>>;
 * }
 *
 * // We can say:
 *
 * type MyUnsecuredApi = Unsecured<MySecuredApi>;
 *
 * // Which is equivalent to:
 *
 * interface MyUnsecuredApi {
 *     post(request: Doc): Promise<Result<AuthError, { id: string }>>;
 * }
 * ```
 */
export type Unsecured<TApi> = { [K in keyof TApi]: UnsecuredFn<TApi[K]> }