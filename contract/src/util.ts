export function modify<T, K extends keyof T>(instance: T, key: K, handler: (value: T[K]) => T[K]): T {
  return Object.assign({}, instance, {[key]: handler(instance[key])});
}

export function replace<T, K extends keyof T>(key: K, value: T[K]): (instance: T) => T {
  return instance => modify(instance, key, const_(value));
}

export function const_<T>(value: T): () => T {
  return () => value;
}

const hasUint8Array = typeof Uint8Array === 'function';
const {toString} = Object.prototype;

// @ts-ignore
const _identity = (x)=>x;

export function identity<T>() : (instance:T)=>T {
  return _identity
}

export function isUint8Array(instance: any): instance is Uint8Array {
  return hasUint8Array && (instance instanceof Uint8Array || toString.call(instance) === '[object Uint8Array]');
}

export function isIterable<T = any>(instance: any): instance is Iterable<T> {
  return typeof instance == 'object' && Symbol.iterator in instance;
}

export function isAsyncIterable(instance: any): instance is AsyncIterable<any> {
  return typeof instance == 'object' && Symbol.asyncIterator in instance;
}

export function isPromiseLike(instance: any): instance is PromiseLike<any> {
  return typeof instance == 'object' && 'then' in instance;
}

export function typeDescription(x: any): string {
  if (x === null)
    return 'null';

  let t = typeof x;
  if (t !== 'object') return t;

  const p = Object.getPrototypeOf(x);
  if (p !== Object.prototype)
    return p.constructor.name;

  return t
}

export async function toPromiseArray<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const value of iterable) result.push(value);
  return result;
}
