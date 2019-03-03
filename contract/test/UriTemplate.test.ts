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

  it('extracts captures', () => {
    const uriTemplate = UriTemplate.of('/part/{capture1}/{capture2}/part/{?query1,query 2}');

    expect(uriTemplate.extract('/part/one/two/part/?query1=value1&query%202=value%202&query3=value3')).eql({
      capture1: 'one',
      capture2: 'two',
      query1: 'value1',
      'query 2': 'value 2'
    });
  });

  it('is reversible', () => {
    const uriTemplate1 = UriTemplate.of('/part/{capture1}/part{?query1}');
    const uri1 = '/part/one/two/part?query1=value1';
    expect(uriTemplate1.uriFrom(uriTemplate1.extract(uri1))).eq(uri1);

    const uriTemplate2 = UriTemplate.of('/part/{capture1}/{capture2}/part{?query1,query2}');
    const uri2 = '/part/one/two/part?query1=value1&query2=value%202';
    expect(uriTemplate2.uriFrom(uriTemplate2.extract(uri2))).eq(uri2);

    const uriTemplate3 = UriTemplate.of('/part/{capture1}/{capture2}/part{?query1,query2,query 3}');
    const uri3 = '/part/one/two/part?query1=value1&query2=value%202&query%203=value3';
    expect(uriTemplate3.uriFrom(uriTemplate3.extract(uri3))).eq(uri3);
  });

  it('encodes / decodes uri segments', () => {
    const uriTemplate = UriTemplate.of('/part/{capture1}/part/{?query 1}');
    const uri = '/part/one%20two/part/?query%201=value%201';

    expect(uriTemplate.extract(uri)).eql({
      capture1: 'one two',
      'query 1': 'value 1'
    });

    expect(uriTemplate.uriFrom(uriTemplate.extract(uri))).eq(uri);
  })

  // TODO: dont match query
  // support custom regex
  // variable expansions like {.foo,bar} and {baz*}
});

