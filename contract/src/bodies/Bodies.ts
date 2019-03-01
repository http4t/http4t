import {Body} from "../contract";
import {handleBody} from "./BodyHandler";
import {textHandler} from "./text";

export class Bodies {
  static async text(body: Body): Promise<string> {
    if (typeof body !== 'undefined')
      return this.maybeText(body) as Promise<string>;
    throw new Error("Body was undefined")
  }

  static maybeText(body: Body): Promise<string | undefined> {
    return handleBody(textHandler, body);
  }
}