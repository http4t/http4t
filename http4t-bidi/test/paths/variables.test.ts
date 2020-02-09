import {expect} from 'chai';
import {v, variablesPath} from "../../src/paths/variables";

const componentVars = {
  first: v.segment,
  second: v.segment
};

describe('variablesPath()', () => {
  it('does not error if everything is empty', async () => {
    const path = variablesPath({}, () => []);
    expect(path.consume("one/two/")).deep.eq({
      value: undefined,
      remaining: "one/two/"
    });
  });
  it('populates variables from path segments', async () => {
    const path = variablesPath(componentVars, v => [v.first, v.second]);
    expect(path.consume("one/two/")).deep.eq(
      {
        value: {first: "one", second: "two"},
        remaining: "/"
      }
    );
  });
  it('interpolates literal values from strings', async () => {
    const path = variablesPath(componentVars, v => [v.first, "two", v.second]);
    expect(path.consume("one/two/three")).deep.eq(
      {
        value: {first: "one", second: "three"},
        remaining: ""
      }
    );
  });
  it('throws an exception if segmentFn is not valid', async () => {
    expect(() => variablesPath(componentVars, () => [])).throws("segmentFn did not populate all keys. Missing: first, second");
  });
});