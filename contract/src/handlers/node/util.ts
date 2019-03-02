import {Header} from "../../contract";

export function fromRawHeaders(rawHeaders: string[]): Header[] {
  if (rawHeaders.length == 0) return [];
  const [name, value, ...remainder] = rawHeaders;
  return [[name, value], ...fromRawHeaders(remainder)];
}

