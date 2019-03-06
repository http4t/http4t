import { Uri } from "./uri";

export type Captures = { [name: string]: string }

export class UriTemplate {
  private pathTemplate: string;
  private queryTemplate?: string;
  private pathVariableCapturingRegexp: RegExp;

  constructor(private template: string) {
    const queryCaptureIdentifier = '{?';
    const [pathTemplate, queryTemplate] = this.template.split(queryCaptureIdentifier);
    this.pathTemplate = pathTemplate;
    this.queryTemplate = queryTemplate ? '{' + queryTemplate : undefined;
    this.pathVariableCapturingRegexp = this.pathVariableCapturingTemplate();
  }

  static of(template: string) {
    return new UriTemplate(template)
  }

  matches(uri: string): boolean {
    return this.pathVariableCapturingRegexp.exec(Uri.parse(uri).path) !== null
  }

  extract(uri: string): Captures {
    const parsedUri = Uri.parse(uri);
    return {
      ...this.extractPathCaptures(parsedUri.path),
      ...this.extractQueryCaptures(parsedUri.query)
    };
  }

  expand(captures: Captures): string {
    return this.expandPath(captures) + this.expandQuery(captures);
  }

  private extractPathCaptures(path: string): Captures {
    const message = new Regex('(.+)').matches('/foo/bar/');
    for (const m of message) {
      console.log(m)
    }
    const pathVariableNames = (this.pathTemplate.match(/{([^:}]+)/g) || []).map(name => name.replace('{', ''));
    const values = this.pathVariableCapturingRegexp.exec(path);

    return pathVariableNames.reduce((captures: Captures, param, index) => {
      if (values && values[index + 1]) {
        captures[param] = decodeURIComponent(values[index + 1])
      }
      return captures;
    }, {});
  }

  private extractQueryCaptures(query: string | undefined): Captures {
    if (!query || !this.queryTemplate) return {};
    return this.queryTemplate
      .replace(/[{}]/g, '')
      .split(',')
      .reduce((captures: Captures, queryParameter: string) => {
        const regExpMatchArray = decodeURIComponent(query).match(new RegExp(`${queryParameter}=([^&]*)`));
        if (!regExpMatchArray) return captures;
        captures[queryParameter] = decodeURIComponent(regExpMatchArray[1]);
        return captures;
      }, {});
  }

  private expandPath(captures: Captures): string {
    return Object.keys(captures).reduce((path: string, variable: string) => {
      return path.replace(`{${variable}}`, encodeURIComponent(captures[variable]))
    }, this.pathTemplate).replace(/[{}]/g, '');
  }

  private expandQuery(captures: Captures): string {
    if (!this.queryTemplate) return '';
    return '?' + this.queryTemplate
      .replace(/[{}]/g, '')
      .split(',')
      .map(queryParameter => {
        return captures[queryParameter] !== undefined
          ? `${encodeURIComponent(queryParameter)}=${encodeURIComponent(captures[queryParameter])}`
          : undefined;
      })
      .filter(it => it !== undefined)
      .join('&');
  }

  private pathVariableCapturingTemplate(): RegExp {
    let noTrailingSlash = this.pathTemplate.replace(/\/$/g, '');
    const templateRewritingRegex = new Regex('{([^}]+?)(?::([^}]+))?}');
    return new RegExp(
      Array.from(templateRewritingRegex.matches(noTrailingSlash)).reduce((pathVariableCapturingTemplate, match) => {
        return pathVariableCapturingTemplate.replace(/{[^}]+}/, match && match[2] ? `(${match[2]})` : '(.+?)');
      }, noTrailingSlash));
  }
}

export function uriTemplate(template: string): UriTemplate {
  return new UriTemplate(template)
}

export class Regex {
  private matched: RegExpExecArray | null;

  constructor(private pattern: string) {
    this.matched = null;
  }

  [Symbol.iterator]() {
    return this.matches('foo')[Symbol.iterator]()
  }

  match(against: string) {
    return new RegExp(this.pattern).exec(against)
  }

  * matches(against: string): Iterable<RegExpExecArray | null> {
    const regex = new RegExp(this.pattern, 'g');
    while (this.matched = regex.exec(against)) {
      yield this.matched;
    }
  }
}