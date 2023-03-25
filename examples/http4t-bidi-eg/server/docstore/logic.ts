import {failure, Result, success} from "@http4t/result";
import {AuthError} from "@http4t/bidi/auth/authError";
import {DocRepository} from "./impl/DocRepository";
import {Logger} from "../utils/Logger";
import {SecuredApi} from "@http4t/bidi/auth/withSecurity";
import {Doc, DocStore} from "@http4t/bidi-eg-client/docstore";
import {DocStoreClaims, WithDocStoreClaims} from "@http4t/bidi-eg-client/auth";

export type DocStoreOpts = { store: DocRepository, logger: Logger };

export function docStoreLogic(opts: DocStoreOpts): SecuredApi<DocStore, DocStoreClaims> {
    const {logger, store} = opts;
    return {
        async get(request: WithDocStoreClaims<{ id: string }>): Promise<Result<AuthError, Doc | undefined>> {
            const result = await store.get(request.value.id);
            logger.info(`retrieved json: ${JSON.stringify(result)}`);

            if (typeof result == "undefined") return success(result);

            const {doc, meta} = result;
            if (meta.owner !== request.security.principal.userName) return success(undefined);

            return success(doc);
        },

        async post(request: WithDocStoreClaims<Doc>): Promise<Result<AuthError, { id: string }>> {
            const existing = await store.get(request.value.id);
            if (existing !== undefined) {
                const {meta} = existing;
                if (meta.owner !== request.security.principal.userName) return failure({
                    reason: "forbidden",
                    message: "You do not own this document"
                });
            }
            const doc = request.value;
            logger.info(`storing json: "${JSON.stringify(doc)}"`);
            await store.save({doc, meta: {owner: request.security.principal.userName}});
            return success({id: doc.id});
        },

        async storeDocThenFail(request: WithDocStoreClaims<Doc>): Promise<Result<AuthError, undefined>> {
            const doc = request.value;
            logger.info('throwing an exception');
            await store.save({doc, meta: {owner: request.security.principal.userName}});
            throw new Error("Deliberate error");
        }
    };
}