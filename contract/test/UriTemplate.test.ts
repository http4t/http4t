import { expect } from "chai";
import { UriTemplate } from "../src/UriTemplate";

describe('UriTemplate', () => {
  it('matches uris or not', () => {
    const uriTemplate = UriTemplate.of('/part/{name}/part');

    expect(uriTemplate.matches('/doesnt/match')).eq(false);
    expect(uriTemplate.matches('/part/capture/part')).eq(true);
  });

  it('ignores trailing slashes', () => {
    const uriTemplate = UriTemplate.of('/part/{capture}/part/');

    expect(uriTemplate.matches('/doesnt/match')).eq(false);
    expect(uriTemplate.matches('/part/capture/part')).eq(true);
    expect(uriTemplate.matches('/part/capture/part/')).eq(true);
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

  it('extracts uri ending', () => {
    const uriTemplate = UriTemplate.of('/part/{capture1}/{capture2:.*}');

    expect(uriTemplate.extract('/part/one/two/three/four')).eql({
      capture1: 'one',
      capture2: 'two/three/four'
    });
  });

  it('is reversible', () => {
    const uriTemplate = UriTemplate.of('/part/{capture1}/{capture2}/part{?query1,query2,query 3}');
    const uri = '/part/one/two/part?query1=value1&query2=value%202&query%203=value3';

    expect(uriTemplate.expand(uriTemplate.extract(uri))).eq(uri);
  });

  it('expanding null or undefined query parameters', () => {
    const uriTemplate = UriTemplate.of('/part{?query1,query2,query3}');
    const uri = '/part?query1=value1&query3=';
    const captures = uriTemplate.extract(uri);

    expect(captures).eql({
      query1: 'value1',
      query3: ''
    });
    expect(uriTemplate.expand(captures)).eq(uri);
  });

  it('encodes / decodes uri segments', () => {
    const uriTemplate = UriTemplate.of('/part/{capture1}/part/{?query 1}');
    const uri = '/part/one%20two/part/?query%201=value%201';

    expect(uriTemplate.extract(uri)).eql({
      capture1: 'one two',
      'query 1': 'value 1'
    });

    expect(uriTemplate.expand(uriTemplate.extract(uri))).eq(uri);
  });

  it('supports custom regex', () => {
    const uriTemplate = UriTemplate.of('/part/{capture1:\\d+}/part/{capture2:\\w?}');
    const uriDoesntMatch = '/part/abc/part/123';
    const uriDoesMatch = '/part/123/part/a';

    expect(uriTemplate.matches(uriDoesntMatch)).eq(false);
    expect(uriTemplate.extract(uriDoesMatch)).eql({
      capture1: '123',
      capture2: 'a'
    });
  });

});

