export interface Logger {
    info(out: string): void

    flush(): void
}

/**
 * Create one of these per request in order to keep logs for each request together in console.out
 */
export class CumulativeLogger implements Logger {
    constructor(private infos: string[] = []) {
    }

    info(out: string): void {
        this.infos.push(out);
    }

    flush(): void {
        console.log(this.infos.join('\n'));
        this.infos = [];
    }
}

