import {Doc} from "@http4t/bidi-eg-client/docstore";

export type DocAndMetaData = {
    doc: Doc,
    meta: { owner: string }
}

export interface DocRepository {
    get(id: string): Promise<DocAndMetaData | undefined>;

    save(doc: DocAndMetaData): Promise<void>;
}


