export type ResolveablePromise<T> = Promise<T> & {
    readonly resolve: (value: T) => void,
    readonly reject: (error: any) => void
};

export function resolveable<T>(): ResolveablePromise<T> {
    let promiseResolve = undefined;
    let promiseReject = undefined;
    const promise = new Promise<T>(
        function (resolve, reject) {
            promiseResolve = resolve;
            promiseReject = reject;
        });
    // @ts-ignore
    promise.resolve = promiseResolve;
    // @ts-ignore
    promise.reject = promiseReject;
    return promise as ResolveablePromise<T>;
}
