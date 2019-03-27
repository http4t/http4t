export class Regex {
  private matched: RegExpExecArray | null;
  private ahead: RegExpExecArray | null;

  constructor(private pattern: string) {
    this.matched = null;
    this.ahead = null;
  }

  match(against: string) {
    return new RegExp(this.pattern).exec(against)
  }

  * matches(against: string): Iterable<[RegExpExecArray | null, string]> {
    const regex = new RegExp(this.pattern, 'g');
    let start = 0;
    let nonMatch = '';
    let rest = '';
    while (this.matched = regex.exec(against)) {
      if (this.matched) {
        const end = against.indexOf(this.matched[0]);
        nonMatch = against.slice(start, end);
        start = end + this.matched[0].length;
        rest = against.slice(start);
        yield [this.matched, nonMatch];
      }
    }
    if (rest.length > 0) yield [null, rest];
  }
}

/*

  * matches(against: string): Iterable<[RegExpExecArray | null, NonMatch]> {
    const regex = new RegExp(this.pattern, 'g');
    let start = 0;
    let nonMatch = '';
    let prevMatch, nextMatch = regex.exec(against);
    do {
      if (nextMatch) {
        prevMatch = nextMatch;
        nextMatch = regex.exec(against);
        const end = against.indexOf(prevMatch[0]);
        nonMatch = against.slice(start, end);
        start = end + prevMatch[0].length;
        yield [prevMatch, nonMatch];
      } else {
       if (prevMatch) {
         // no next match, but there is a prev match, so chunk in the rest of the against
         const rest = against.slice(start);
         if (rest.length > 0) yield [prevMatch, rest];
         break;
       } else {
         // no matches at all
         yield [null, against];
         break;
       }
      }
    } while (true);
  }
 */