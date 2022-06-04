import {ResponseLens} from "./lenses";
import {ResponseByStatusLens} from "./lenses/ResponseByStatusLens";


export function response<TServer,TClient>(status: number, lens: ResponseLens<TClient,TServer>): ResponseLens<TClient,TServer> {
    return new ResponseByStatusLens({[status]: lens}, () => status);
}

export * from "./messages"
export {orNotFound} from "./lenses/OrNotFoundLens"
export {statuses} from "./lenses/ResponseByStatusLens"