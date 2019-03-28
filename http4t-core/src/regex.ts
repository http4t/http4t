export class Regex {
  matched: (RegExpExecArray | null)[] = [];
  nonMatched: string[] = [];

  constructor(private pattern: string) {
    this.matched = [];
    this.nonMatched = [];
  }

  match(against: string) {
    return new RegExp(this.pattern).exec(against)
  }

  * matches(against: string): Iterable<RegExpExecArray | null> {
    const regex = new RegExp(this.pattern, 'g');
    let start = 0;
    let nonMatch = '';
    let rest = '';
    let match;
    while (match = regex.exec(against)) {
      if (match) {
        const end = against.indexOf(match[0]);
        nonMatch = against.slice(start, end);
        start = end + match[0].length;
        rest = against.slice(start);
        this.matched.push(match);
        this.nonMatched.push(nonMatch);

        yield match;
      }
    }
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