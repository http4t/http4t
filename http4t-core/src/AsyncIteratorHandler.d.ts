export declare class AsyncIteratorHandler<T> implements AsyncIterator<T> {
    private pullQueue;
    private pushQueue;
    next(): Promise<IteratorResult<T>>;
    push(value: T): void;
    private pull;
    end(): void;
    error(e: any): void;
    private close;
    private closed;
}
