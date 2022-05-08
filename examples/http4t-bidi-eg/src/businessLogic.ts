import {CredStore} from "./auth";
import {Doc, DocRepository} from "./docstore";
import {CumulativeLogger} from "./utils/Logger";
import {Jwt, JwtStrategy} from "@http4t/bidi-jwt";
import {FullApi, User, WithOurClaims} from "./api";
import {isFailure, Result, success} from "@http4t/result";
import {AuthError} from "@http4t/bidi/auth";

export type LogicOpts = { creds: CredStore, store: DocRepository, logger: CumulativeLogger, jwt: JwtStrategy };

export function businessLogic(opts: LogicOpts): FullApi {
    const {creds, jwt, logger, store} = opts;
    return {
        async login(request: { userName: string; password: string }): Promise<Result<string, Jwt>> {
            const result = await creds.check(request);
            if (isFailure(result)) return result;
            const userJwt = {payload: {userName: request.userName}};
            const token = await jwt.sign(userJwt);
            return success({originalToken: token, ...userJwt})

        },
        async register(request: { userName: string; password: string }): Promise<Result<string, User>> {
            const result = await creds.save(request);
            if (isFailure(result)) return result;
            return success({userName: request.userName})
        },
        async live(): Promise<undefined> {
            logger.info('probed live');
            return undefined;
        },
        async ready(): Promise<undefined> {
            logger.info('probed ready');
            return undefined;
        },
        async get(request: WithOurClaims<{ id: string }>): Promise<Result<AuthError, Doc | undefined>> {
            const result = await store.get(request.value.id);
            logger.info(`retrieved json: ${JSON.stringify(result)}`);

            if(typeof result == "undefined") return success(result);

            const {doc, meta} = result;
            if (meta.owner !== request.claims.principal.userName) return success(undefined);

            return success(doc);
        },
        async post(request: WithOurClaims<Doc>): Promise<Result<AuthError, { id: string }>> {
            const doc = request.value;
            logger.info(`storing json: "${JSON.stringify(doc)}"`);
            await store.save({doc, meta: {owner: request.claims.principal.userName}});
            return success({id: doc.id});
        },
        async storeDocThenFail(request: WithOurClaims<Doc>): Promise<Result<AuthError, undefined>> {
            const doc = request.value;
            logger.info('throwing an exception');
            await store.save({doc, meta: {owner: request.claims.principal.userName}});
            throw new Error("Deliberate error");
        }
    };
}