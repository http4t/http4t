import {Transaction} from "./TransactionPool";

export type Doc = {
    id: string;
    document: any;
}

export interface Store {
    get(id: string): any;

    save(doc: Doc): Promise<void>;
}


export class PostgresStore implements Store {
    constructor(private transaction: Transaction) {
    }

    async save(doc: Doc): Promise<void> {
        await this.transaction.query('INSERT INTO store values($1, $2) returning *', [doc.id, doc.document]);
    }

    async get(id: string): Promise<Doc | undefined> {
        const query = await this.transaction.query('SELECT * FROM store t WHERE t.id = $1', [id]);
        return query.rows[0];
    }
}