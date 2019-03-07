import {assert, expect} from 'chai';
import { authority, Uri } from "../src";

describe('Uri', function() {
  describe('implements RFC 3986 https://tools.ietf.org/html/rfc3986', function() {
    it('when converting to JSON return the string', function() {
      const uri = Uri.parse('http://www.ics.uci.edu/pub/ietf/uri/#Related');
      assert.equal(JSON.stringify(uri), '"http://www.ics.uci.edu/pub/ietf/uri/#Related"');
    });

    it('can parse example from #appendix-B', function() {
      const uri = Uri.parse('http://www.ics.uci.edu/pub/ietf/uri/#Related');
      assert.equal(uri.scheme, 'http');
      assert.equal(uri.authority!.toString(), 'www.ics.uci.edu');
      assert.equal(uri.path, '/pub/ietf/uri/');
      assert.equal(uri.query, undefined);
      assert.equal(uri.fragment, 'Related');
    });

    it('can parse query string', function() {
      const uri = Uri.parse('?foo=bar');
      assert.equal(uri.scheme, undefined);
      assert.equal(uri.authority, undefined);
      assert.equal(uri.path, '');
      assert.equal(uri.query, 'foo=bar');
      assert.equal(uri.fragment, undefined);
    });

    function assertComponentRecomposition(original:string) {
      assert.equal(Uri.parse(original).toString(), original);
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

    it('parses authority and userinfo', function () {
      expect(authority('user:password@tld.domain.com:443').userInfo).eql({ username: 'user', password: 'password'});
      assert.equal(authority('user:password@tld.domain.com:443').host, 'tld.domain.com');
      assert.equal(authority('user:password@tld.domain.com:443').port, '443');
      assert.equal(authority('user:password@0.0.0.0:443').host, '0.0.0.0');
    });

    it('ignores if authority and userinfo not present', function () {
      expect(authority('tld.domain.com:443').userInfo).eql(undefined);
    });

    it('defaults password', function () {
      expect(authority('user:@tld.domain.com:443').userInfo).eql({username: 'user', password: ''});
    });

    it('no port', function () {
      assert.equal(authority('tld.domain.com').port, undefined);
    });

    it('supports toString()', function () {
      const string = 'user:password@tld.domain.com:443';
      assert.equal(authority(string).toString(), string);
    });
  });

  it('supports toJSON ', function () {
    assert.equal(JSON.stringify(Uri.parse('http://www.ics.uci.edu/pub/ietf/uri/#Related')), '"http://www.ics.uci.edu/pub/ietf/uri/#Related"');
  });
});

