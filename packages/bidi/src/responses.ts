import {ResponseLens} from "./lenses";
import {StatusLens} from "./lenses/StatusLens";

export function response<T>(status: number, lens: ResponseLens<T>): StatusLens<T> {
    return new StatusLens(status, lens);
}