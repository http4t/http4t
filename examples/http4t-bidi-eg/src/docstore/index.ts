export type Doc = {
    id: string;
    document: any;
}

export type DocAndMetaData = {
    doc:Doc,
    meta: {owner:string}
}
export interface DocRepository {
    get(id: string): Promise<DocAndMetaData | undefined>;

    save(doc: DocAndMetaData): Promise<void>;
}


