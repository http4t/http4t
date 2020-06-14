export interface Logger {
    info(out: string): void

    flush(): void
}

export class CumulativeLogger implements Logger {
    constructor(private infos: string[] = []) {
    }

    info(out: string): void {
        this.infos.push(out);
    }

    flush(): void {
        console.log(this.infos.join(' | '));
        this.infos = [];
    }
}

