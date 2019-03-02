// TODO: this is janky, but nice error messages are nice. Have a think about it
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

export function runningInNode() {
  return (typeof process !== 'undefined') && (typeof process.versions.node !== 'undefined');
}

