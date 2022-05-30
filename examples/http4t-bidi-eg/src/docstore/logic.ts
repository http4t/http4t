import {Result, success} from "@http4t/result";
import {WithOurClaims} from "../auth/api";
import {AuthError} from "@http4t/bidi/auth/authError";
import {Doc, DocRepository} from "./impl/DocRepository";
import {CumulativeLogger} from "../utils/Logger";
import {DocStore} from "./api";

export type DocStoreOpts = { store: DocRepository, logger: CumulativeLogger };

export function docStoreLogic(opts: DocStoreOpts): DocStore {
    const {logger, store} = opts;
    return {
        async get(request: WithOurClaims<{ id: string }>): Promise<Result<AuthError, Doc | undefined>> {
            const result = await store.get(request.value.id);
            logger.info(`retrieved json: ${JSON.stringify(result)}`);

            if (typeof result == "undefined") return success(result);

            const {doc, meta} = result;
            if (meta.owner !== request.security.principal.userName) return success(undefined);

            return success(doc);
        },
        async post(request: WithOurClaims<Doc>): Promise<Result<AuthError, { id: string }>> {
            const doc = request.value;
            logger.info(`storing json: "${JSON.stringify(doc)}"`);
            await store.save({doc, meta: {owner: request.security.principal.userName}});
            return success({id: doc.id});
        },
        async storeDocThenFail(request: WithOurClaims<Doc>): Promise<Result<AuthError, undefined>> {
            const doc = request.value;
            logger.info('throwing an exception');
            await store.save({doc, meta: {owner: request.security.principal.userName}});
            throw new Error("Deliberate error");
        }
    };
}