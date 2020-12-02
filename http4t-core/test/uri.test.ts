import {assert} from 'chai';
import {ParsedAuthority} from "@http4t/core/contract";
import {Authority, Uri} from "@http4t/core/uri";

describe('Uri', function () {
    describe('implements RFC 3986 https://tools.ietf.org/html/rfc3986', function () {
        it('when converting to JSON return the string', function () {
            const uri = Uri.parse('http://www.ics.uci.edu/pub/ietf/uri/#Related');
            assert.equal(JSON.stringify(uri), '"http://www.ics.uci.edu/pub/ietf/uri/#Related"');
        });

        it('can parse example from #appendix-B', function () {
            const uri = Uri.parse('http://www.ics.uci.edu/pub/ietf/uri/#Related');
            assert.deepEqual(uri, Uri.of({
                scheme: 'http',
                authority: Authority.of({host: 'www.ics.uci.edu'}),
                path: '/pub/ietf/uri/',
                fragment: 'Related'
            }));
        });

        it('can parse query string', function () {
            const uri = Uri.parse('?foo=bar');
            assert.deepEqual(uri, Uri.of({
                path: "",
                query: 'foo=bar'
            }));
        });

        function assertComponentRecomposition(original: string) {
            assert.equal(Uri.parse(original).toString(), original);
        }

        it('supports toString() using Component Recomposition from #section-5.3', function () {
            assertComponentRecomposition('http://www.ics.uci.edu/pub/ietf/uri/#Related');
        });

        it('preserves the distinction between a component that is undefined and empty', function () {
            assertComponentRecomposition('file:///home/dan'); // Empty authority
            assertComponentRecomposition('/some/path'); // Just a path
            assertComponentRecomposition('ldap:///o=University%20of%20Michigan,c=US');
            assertComponentRecomposition('?foo'); // Just a query string
        });

        function assertAuthority(authority: string, expected: ParsedAuthority) {
            const parsed = Uri.parse(authority);
            assert.deepEqual(parsed.authority, Authority.of(expected));
            assert.equal(parsed.toString(), authority);
        }

        it('parses authority https://tools.ietf.org/html/rfc3986#section-3.2', function () {
            // just host
            assertAuthority('ldap://www.example.com/c=GB?objectClass?one', {host: 'www.example.com'});

            // userinfo
            assertAuthority('https://user@www.example.com/c=GB?objectClass?one', {
                host: 'www.example.com',
                user: 'user'
            });

            // userinfo with blank password
            assertAuthority('https://user:@www.example.com/c=GB?objectClass?one', {
                host: 'www.example.com',
                user: 'user:'
            });

            // userinfo with password
            assertAuthority('https://user:password@www.example.com/c=GB?objectClass?one', {
                host: 'www.example.com',
                user: 'user:password'
            });

            // userinfo with port
            assertAuthority('https://user@www.example.com:443', {host: 'www.example.com', user: 'user', port: 443});
        });

        it('supports IPv6 host in authority https://tools.ietf.org/html/rfc3986#section-3.2', function () {
            // just host
            assertAuthority('ldap://[2001:db8::7]/c=GB?objectClass?one', {host: '[2001:db8::7]'});

            // userinfo
            assertAuthority('https://user@[2001:db8::7]/c=GB?objectClass?one', {host: '[2001:db8::7]', user: 'user'});

            // userinfo with blank password
            assertAuthority('https://user:@[2001:db8::7]/c=GB?objectClass?one', {host: '[2001:db8::7]', user: 'user:'});

            // userinfo with password
            assertAuthority('https://user:password@[2001:db8::7]/c=GB?objectClass?one', {
                host: '[2001:db8::7]',
                user: 'user:password'
            });

            // userinfo with port
            assertAuthority('https://user@[2001:db8::7]:443', {host: '[2001:db8::7]', user: 'user', port: 443});
        });
    });

    it('supports toJSON ', function () {
        assert.equal(JSON.stringify(Uri.parse('http://www.ics.uci.edu/pub/ietf/uri/#Related')), '"http://www.ics.uci.edu/pub/ietf/uri/#Related"');
    });
});
