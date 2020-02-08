import {expect} from 'chai';
import {header, setHeader} from "../src/headers";

describe('setHeader()', () => {
  it('works with empty array', async () => {
    expect(setHeader([], header('header-name', 'value')))
      .deep.eq([['header-name', 'value']])
  });

  it('deletes old header value', async () => {
    expect(setHeader([
      header('unchanged', 'first'),
      header('header-name', 'old value'),
      header('unchanged', 'second')], header('header-name', 'new value')))
      .deep.eq([['unchanged', 'first'], ['unchanged', 'second'], ['header-name', 'new value']])
  });

  it('is case insensitive', async () => {
    expect(setHeader([header('header-name', 'old value')], header('Header-Name', 'value')))
      .deep.eq([['Header-Name', 'value']])
  });
});