import {expect} from 'chai';
import {
  consume,
  endOfPath,
  exactlyChars,
  exactlySegments,
  nextSlashOrEnd,
  upToChars,
  upToSegments
} from "../../src/paths/consume";

describe('consume()', () => {
  it('consumes up to index defined by consumer function', async () => {
    const result = consume("some/path", () => 4);
    expect(result).deep.eq({
      captured: "some",
      consumed: "some",
      remaining: "/path"
    })
  });

  it('strips leading slashes before consuming', async () => {
    const result = consume("//some/path", () => 4);
    expect(result).deep.eq({
      captured: "some",
      consumed: "//some",
      remaining: "/path"
    })
  });

  it('returns undefined on no match', async () => {
    const result = consume("some/path", () => -1);
    expect(result).eq(undefined)
  });

  it('throws helpful exception if consumer return impossible index', async () => {
    expect(() => consume("/12345678", () => 9))
      .throws("cannot consume 9 characters from 8 character path '12345678'")
  });
});

describe('consumers', () => {
  describe('upToChars', () => {
    it('consumes all characters available', async () => {
      const result = consume("12345678", upToChars(4));
      expect(result).deep.eq({
        captured: "1234",
        consumed: "1234",
        remaining: "5678"
      })
    });
    it('returns last index if insufficient characters', async () => {
      const result = consume("123", upToChars(4));
      expect(result).deep.eq({
        captured: "123",
        consumed: "123",
        remaining: ""
      })
    });
  });
  describe('exactlyChars', () => {
    it('consumes all characters', async () => {
      const result = consume("12345678", exactlyChars(4));
      expect(result).deep.eq({
        captured: "1234",
        consumed: "1234",
        remaining: "5678"
      });
    });
    it('returns -1 if insufficient characters', async () => {
      const result = consume("123", exactlyChars(4));
      expect(result).deep.eq(undefined);
    });
  });
  describe('upToSegments', () => {
    it('consumes all segments', async () => {
      const result = consume("one/two/three/four", upToSegments(3));
      expect(result).deep.eq({
        captured: "one/two/three",
        consumed: "one/two/three",
        remaining: "/four"
      });
    });
    it('consumes all segments with trailing slash', async () => {
      const result = consume("one/two/three/four/", upToSegments(3));
      expect(result).deep.eq({
        captured: "one/two/three",
        consumed: "one/two/three",
        remaining: "/four/"
      });
    });
    it('can consume whole path if necessary', async () => {
      const result = consume("one/two/three", upToSegments(3));
      expect(result).deep.eq({
        captured: "one/two/three",
        consumed: "one/two/three",
        remaining: ""
      });
    });
    it('can consume whole path if necessary with trailing slash', async () => {
      const result = consume("one/two/three/", upToSegments(3));
      expect(result).deep.eq({
        captured: "one/two/three",
        consumed: "one/two/three",
        remaining: "/"
      });
    });
    it('returns available segments if insufficient', async () => {
      const result = consume("one/two", upToSegments(3));
      expect(result).deep.eq({
        captured: "one/two",
        consumed: "one/two",
        remaining: ""
      });
    });
  });
  describe('exactlySegments', () => {
    it('consumes all segments', async () => {
      const result = consume("one/two/three/four", exactlySegments(3));
      expect(result).deep.eq({
        captured: "one/two/three",
        consumed: "one/two/three",
        remaining: "/four"
      });
    });
    it('consumes all segments with trailing slash', async () => {
      const result = consume("one/two/three/four/", exactlySegments(3));
      expect(result).deep.eq({
        captured: "one/two/three",
        consumed: "one/two/three",
        remaining: "/four/"
      });
    });
    it('can consume whole path if necessary', async () => {
      const result = consume("one/two/three", exactlySegments(3));
      expect(result).deep.eq({
        captured: "one/two/three",
        consumed: "one/two/three",
        remaining: ""
      });
    });
    it('can consume whole path if necessary with trailing slash', async () => {
      const result = consume("one/two/three/", exactlySegments(3));
      expect(result).deep.eq({
        captured: "one/two/three",
        consumed: "one/two/three",
        remaining: "/"
      });
    });
    it('returns nothing if insufficient segments', async () => {
      const result = consume("one/two", exactlySegments(3));
      expect(result).eq(undefined);
    });
  });

  describe('nextSlashOrEnd', () => {
    it('consumes one segment', async () => {
      const result = consume("one/two", nextSlashOrEnd);
      expect(result).deep.eq({
        captured: "one",
        consumed: "one",
        remaining: "/two"
      });
    });
    it('returns whole string if no next slash', async () => {
      const result = consume("/segment", nextSlashOrEnd);
      expect(result).deep.eq({
        captured: "segment",
        consumed: "/segment",
        remaining: ""
      });
    });
    it('returns nothing for empty string (should never happen)', async () => {
      const result = consume("", nextSlashOrEnd);
      expect(result).deep.eq(undefined);
    });
  });

  describe('endOfPath', () => {
    it('consumes all segments', async () => {
      const result = consume("one/two", endOfPath);
      expect(result).deep.eq({
        captured: "one/two",
        consumed: "one/two",
        remaining: ""
      });
    });
    it('includes trailing slash (is this good?)', async () => {
      const result = consume("one/two/", endOfPath);
      expect(result).deep.eq({
        captured: "one/two/",
        consumed: "one/two/",
        remaining: ""
      });
    });
    it('returns nothing for empty string (should never happen)', async () => {
      const result = consume("", endOfPath);
      expect(result).deep.eq(undefined);
    });
  });
});