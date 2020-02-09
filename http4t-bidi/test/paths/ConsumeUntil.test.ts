import {expect} from 'chai';
import {ConsumeUntil} from "../../src/paths/ConsumeUntil";

describe('ConsumeUntil', () => {
  it('returns undefined if consumer returns -1', async () => {
    const cu = new ConsumeUntil(()=>-1);
    expect(cu.consume("whatever")).eq(undefined);
  });

  it('returns matched path', async () => {
    const cu = new ConsumeUntil(()=>4);
    expect(cu.consume("12345678")).deep.eq({
      value: "1234",
      remaining: "5678"
    });
  });
});