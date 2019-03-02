import { expect } from "chai";
import { UriTemplate } from "../src/UriTemplate";

describe('UriTemplate', () => {
  it('matches uris or not', () => {
    const uriTemplate = UriTemplate.of('/part/{capture}/part/?query1=value1');

    expect(uriTemplate.matches('/doesnt/match')).eq(false);
    expect(uriTemplate.matches('/part/capture/part')).eq(true);
  });

  it('ignores trailing slashes', () => {
    const uriTemplate = UriTemplate.of('/part/{capture}/part/');

    expect(uriTemplate.matches('/doesnt/match')).eq(false);
    expect(uriTemplate.matches('/part/capture/part')).eq(true);
    expect(uriTemplate.matches('/part/capture/part/')).eq(true);
    expect(uriTemplate.matches('/part/capture/part?query=value')).eq(true);
    expect(uriTemplate.matches('/part/capture/part/?query=value')).eq(true);
  });

  it('matches query or not', () => {
    const uriTemplate = UriTemplate.of('/part/{capture}/part/{?query1,query2}');

    expect(uriTemplate.matches('/part/capture/part?query1=value1')).eq(false);
    expect(uriTemplate.matches('/part/capture/part/?query1=value1&query2=value2')).eq(true);
  });

  it('extracts captures', () => {
    const uriTemplate = UriTemplate.of('/part/{capture1}/{capture2}/part/{?query1,query2}');

    expect(uriTemplate.extract('/part/one/two/part/?query1=value1&query2=value2&query3=value3')).eql({
      capture1: 'one',
      capture2: 'two',
      query1: 'value1',
      query2: 'value2'
    });
  });

  it('is reversible', () => {
    const uriTemplate1 = UriTemplate.of('/part/{capture1}/part{?query1}');
    const captures1 = uriTemplate1.extract('/part/one/two/part?query1=value1');
    expect(uriTemplate1.uriFrom(captures1)).eq('/part/one/two/part?query1=value1');

    const uriTemplate2 = UriTemplate.of('/part/{capture1}/{capture2}/part{?query1,query2}');
    const captures2 = uriTemplate2.extract('/part/one/two/part?query1=value1&query2=value2');
    expect(uriTemplate2.uriFrom(captures2)).eq('/part/one/two/part?query1=value1&query2=value2');

    const uriTemplate3 = UriTemplate.of('/part/{capture1}/{capture2}/part{?query1,query2,query3}');
    const captures3 = uriTemplate3.extract('/part/one/two/part?query1=value1&query2=value2&query3=value3');
    expect(uriTemplate3.uriFrom(captures3)).eq('/part/one/two/part?query1=value1&query2=value2&query3=value3');
  });

});

