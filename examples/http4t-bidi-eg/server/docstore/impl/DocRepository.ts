import {DocAndMetaData} from "@http4t/bidi-eg-client/docstore";

export interface DocRepository {
    get(id: string): Promise<DocAndMetaData | undefined>;

    save(doc: DocAndMetaData): Promise<void>;
}


