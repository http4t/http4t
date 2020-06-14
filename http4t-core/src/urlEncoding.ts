export type DecodedPair = [string, string | null];

export function decode(value: string): string {
    return decodeURIComponent(value.replace('+', ' '));
}

export function encode(value: string): string {
    return encodeURIComponent(value).replace('%20', '+');
}

export function parsePair(pair: string): DecodedPair {
    const [name, value] = pair.split('=');
    const decoded = pair.indexOf('=') < 0 ? null : decode(value);
    return [decode(name), decoded]
}

export function parse(value: string): DecodedPair[] {
    return value
        .split('&')
        .map(p => parsePair(p));
}

export function unparsePair([name, value]: DecodedPair): string {
    const encodedValue = value === null
        ? ""
        : `=${encode(value)}`;

    return `${encode(name)}${encodedValue}`
}

export function unparse(values: DecodedPair[]): string {
    return values
        .map(unparsePair)
        .join('&');
}