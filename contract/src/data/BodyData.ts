import {Data} from "../contract";
import {handleData} from "./DataHandler";
import {asString} from "./text";

export class BodyData {
  static asString(data: Data): string {
    return handleData(asString, data);
  }
}