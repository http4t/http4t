export function intersection<A, B, C>(a: A, b: B, c: C): A & B & C {
    return Object.assign({}, a, b, c);
}