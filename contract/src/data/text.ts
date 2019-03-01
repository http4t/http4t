import {TextDecoder} from "util";
import {identity} from "../util";
import {DataHandler} from "./DataHandler";

export const asString: DataHandler<string> = {
  bytes: (d) => new TextDecoder("utf-8").decode(d),
  string: identity(),
};