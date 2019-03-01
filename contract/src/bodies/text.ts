import {Data} from "../contract";
import {asString, BodyData, handleData} from "../data";
import {toPromiseArray} from "../util";
import {BodyHandler} from "./BodyHandler";

// TODO: Remove?
class TextHandler implements BodyHandler<string | undefined> {
  async asynciterable(body: AsyncIterable<Data>): Promise<string> {
    return (await toPromiseArray(body)).map(BodyData.asString).join("");
  }

  async data(body: Data): Promise<string> {
    return handleData(asString, body);
  }

  async iterable(body: Iterable<Data>): Promise<string> {
    return [...body].map(BodyData.asString).join("");
  }

  async promise(body: Promise<Data>): Promise<string> {
    return this.data(await body);
  }

}

export const textHandler = new TextHandler();