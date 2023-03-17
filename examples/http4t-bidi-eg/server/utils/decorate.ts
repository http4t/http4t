export type Fn = (...args: any) => any;

export type AsyncFn<T> =
    T extends Fn
        ? (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>
        : T;

export interface Decorator {
    beforeExecution?: () => any;
    afterSuccess?: (result: any) => any;
    onException?: (e: any) => any;
    finally?: () => any;
}

export type AsyncApi<T extends object> = { [K in keyof T]: AsyncFn<T[K]> };

export function decorate<T extends object>(api: T, decorator: Decorator): AsyncApi<T> {
    return Object
        .entries(api)
        .reduce((acc, [k, v]) => {
                if (typeof v !== "function") {
                    (acc as any)[k] = v;
                } else {
                    (acc as any)[k] = async (...args: any) => {
                        await decorator.beforeExecution?.();
                        try {
                            const result = await v(...args);
                            await decorator.afterSuccess?.(result);
                            return result;
                        } catch (e) {
                            await decorator.onException?.(e);
                            throw e;
                        } finally {
                            await decorator.finally?.();
                        }

                    }
                }
                return acc;
            },
            {} as AsyncApi<T>);
}