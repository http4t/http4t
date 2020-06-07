import {success} from "@http4t/result";
import {failure} from "@http4t/result/JsonPathResult";
import {expect} from 'chai';
import {ConsumeUntil} from "../../src/paths/ConsumeUntil";

describe('ConsumeUntil', () => {
  it('returns undefined if consumer returns -1', async () => {
    const cu = new ConsumeUntil(() => -1);
    expect(cu.consume("whatever")).deep.eq(
      failure("path did not match"));
  });

  it('returns matched path', async () => {
    const cu = new ConsumeUntil(() => 4);
    expect(cu.consume("12345678")).deep.eq(
      success({
          value: "1234",
          remaining: "5678"
        }
      ));
  });
});