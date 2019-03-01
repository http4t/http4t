import {assert} from 'chai';
import {parse, parsed, string} from "../src/uris";

describe('parse()', function() {
  describe('implements RFC 3986 https://tools.ietf.org/html/rfc3986', function() {
    it('can parse example from #appendix-B', function() {
      const uri = parse('http://www.ics.uci.edu/pub/ietf/uri/#Related');
      assert.equal(uri.scheme, 'http');
      assert.equal(uri.authority, 'www.ics.uci.edu');
      assert.equal(uri.path, '/pub/ietf/uri/');
      assert.equal(uri.query, undefined);
      assert.equal(uri.fragment, 'Related');
    });

    it('can parse query string', function() {
      const uri = parse('?foo=bar');
      assert.equal(uri.scheme, undefined);
      assert.equal(uri.authority, undefined);
      assert.equal(uri.path, '');
      assert.equal(uri.query, 'foo=bar');
      assert.equal(uri.fragment, undefined);
    });

    function assertComponentRecomposition(original:string) {
      assert.equal(string(parse(original)), original);
    }

    it('supports toString() using Component Recomposition from #section-5.3', function() {
      assertComponentRecomposition('http://www.ics.uci.edu/pub/ietf/uri/#Related');
    });

    it('preserves the distinction between a component that is undefined and empty', function() {
      assertComponentRecomposition('file:///home/dan'); // Empty authority
      assertComponentRecomposition('/some/path'); // Just a path
      assertComponentRecomposition('ldap:///o=University%20of%20Michigan,c=US');
      assertComponentRecomposition('?foo'); // Just a query string
    });
  });
});

describe('parsed()', function() {
  it('parses strings',()=>{
    const uri = parsed('/test');
    assert.equal(uri.scheme, undefined);
    assert.equal(uri.authority, undefined);
    assert.equal(uri.path, '/test');
    assert.equal(uri.query, undefined);
    assert.equal(uri.fragment, undefined);
  });
  it('passes through objects',()=>{
    const uri = parse('/test');
    const actual = parsed(uri);
    assert.equal(actual, uri);
  })
});