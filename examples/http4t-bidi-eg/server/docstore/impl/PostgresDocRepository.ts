import {Transaction} from "../../utils/transactions/TransactionPool";
import {DocAndMetaData, DocRepository} from "./DocRepository";

export class PostgresDocRepository implements DocRepository {
    constructor(private transaction: Transaction) {
    }

    async save(doc: DocAndMetaData): Promise<void> {
        await this.transaction.query('INSERT INTO store values($1, $2, $3) returning *', [doc.doc.id, doc.meta.owner, doc.doc.document]);
    }

    async get(id: string): Promise<DocAndMetaData | undefined> {
        const query = await this.transaction.query('SELECT * FROM store t WHERE t.id = $1', [id]);
        if (query.rowCount === 0) return undefined;
        const row = query.rows[0];
        return {doc: {id: row.id, document: row.document}, meta: {owner: row.owner}};
    }
}