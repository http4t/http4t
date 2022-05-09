// function authRoute<TReq, TRes>(base: Route<TReq, TRes>): Route<WithJwt<TReq>, Result<AuthError, TRes>> {
//     return route(
//         named({payload: base.request, jwt: jwt()}),
//         result(
//             base.response,
//             statuses({
//                     401: json<AuthError>(),
//                     403: json<AuthError>()
//                 },
//                 (v: AuthError) => v.reason === "forbidden"
//                     ? 401
//                     : 403)
//         )
//     );
// }
//
// function authRoutes<T>(routes: Routes<T>): Routes<WithAuth<T>> {
//     const result = {} as any;
//     for (const [k, v] of Object.entries(routes)) {
//         result[k] = authRoute(v as any)
//     }
//     return result;
// }


describe('JwtLens', function () {

});