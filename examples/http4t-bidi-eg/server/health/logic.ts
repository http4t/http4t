import {Logger} from "../utils/Logger";
import {Health} from "@http4t/bidi-eg-client/health";

export type HealthOpts = { logger: Logger };

export function healthLogic(opts: HealthOpts): Health {
    const {logger} = opts;
    return {
        async live(): Promise<undefined> {
            logger.info('probed live');
            return undefined;
        },
        async ready(): Promise<undefined> {
            logger.info('probed ready');
            return undefined;
        }
    };
}