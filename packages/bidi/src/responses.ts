import {ResponseLens} from "./lenses";
import {ResponseByStatusLens} from "./lenses/ResponseByStatusLens";


export function response<T>(status: number, lens: ResponseLens<T>): ResponseLens<T> {
    return new ResponseByStatusLens({[status]: lens}, () => status);
}

export * from "./messages"
export {orNotFound} from "./lenses/OrNotFoundLens"
export {statuses} from "./lenses/ResponseByStatusLens"