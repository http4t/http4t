import {Health} from "./api";
import {CumulativeLogger} from "../utils/Logger";

export type HealthOpts = { logger: CumulativeLogger };

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