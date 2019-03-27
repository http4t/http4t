import { Uri } from "./uri";

export type Captures = { [name: string]: string|string[] }

export class UriTemplate {
  private pathTemplate: string;
  private queryTemplate?: string;
  private pathVariableCapturingRegexp: Regex;

  constructor(private template: string) {
    const [pathTemplate, queryTemplate] = this.template.split('{?');
    this.pathTemplate = pathTemplate;
    this.queryTemplate = queryTemplate ? '{' + queryTemplate : undefined;
    this.pathVariableCapturingRegexp = this.pathVariableCapturingTemplate();
  }

  static of(template: string) {
    return new UriTemplate(template)
  }

  matches(uri: Uri | string): boolean {
    const path = typeof uri === 'string' ? Uri.parse(uri).path : uri.path;
    return this.pathVariableCapturingRegexp.match(path) !== null
  }

  extract(uri: Uri | string): Captures {
    const parsedUri = typeof uri === 'string' ? Uri.parse(uri) : uri;
    return {
      ...this.extractPathCaptures(parsedUri.path),
      ...this.extractQueryCaptures(parsedUri.query)
    };
  }

  expand(captures: Captures): string {
    return this.expandPath(captures) + this.expandQuery(captures);
  }

  private extractPathCaptures(path: string): Captures {
    const pathVariableNames = (this.pathTemplate.match(/{([^:}]+)/g) || []).map(name => name.replace('{', ''));
    const values = this.pathVariableCapturingRegexp.match(path);

    return pathVariableNames.reduce((captures: Captures, pathParam: string, index: number) => {
      if (values && values[index + 1]) {
        captures[pathParam] = decodeURIComponent(values[index + 1])
      }
      return captures;
    }, {});
  }

  private expandPath(captures: Captures): string {
    return Object.keys(captures).reduce((path: string, variable: string) => {
      return path.replace(`{${variable}}`, encodeURIComponent(captures[variable] as string))
    }, this.pathTemplate).replace(/[{}]/g, '');
  }

  private extractQueryCaptures(query: string | undefined): Captures {
    if (!query || !this.queryTemplate) return {};
    return this.queryTemplate
      .replace(/[{}]/g, '')
      .split(',')
      .reduce((captures: Captures, queryParameter: string) => {
        const matches = Array.from(new Regex(`${queryParameter}=([^&]*)`).matches(decodeURIComponent(query)));
        if (matches.length === 0) return captures;
        matches.forEach(match => {
          if (match) {
            if (captures[queryParameter]) {
              if (typeof captures[queryParameter] === 'string') {
                captures[queryParameter] = [captures[queryParameter] as string, decodeURIComponent(match[1])];
              } else {
                (captures[queryParameter] as string[]).push(decodeURIComponent(match[1]))
              }
            } else {
              captures[queryParameter] = decodeURIComponent(match[1]);
            }
          }
        });
        return captures;
      }, {});
  }

  private expandQuery(captures: Captures): string {
    if (!this.queryTemplate) return '';
    return '?' + this.queryTemplate
      .replace(/[{}]/g, '')
      .split(',')
      .map(queryParameter => {
        if (captures[queryParameter] !== undefined) {
          if (typeof captures[queryParameter] === 'string') {
            return `${encodeURIComponent(queryParameter)}=${encodeURIComponent(captures[queryParameter] as string)}`;
          } else {
            return (captures[queryParameter] as string[]).map(queryCapture => {
              return `${encodeURIComponent(queryParameter)}=${encodeURIComponent(queryCapture)}`
            }).join('&')
          }
        } else {
          return undefined;
        }
      })
      .filter(it => it !== undefined)
      .join('&');
  }

  private pathVariableCapturingTemplate(): Regex {
    const templateNoTrailingSlash = this.pathTemplate.replace(/\/$/g, '');
    const templateRewritingRegex = new Regex('{([^}]+?)(?::([^}]+))?}');
    const matches = Array.from(templateRewritingRegex.matches(templateNoTrailingSlash));
    const pathVariableCapturingTemplate = matches.reduce((pathVariableCapturingTemplate: string, match: RegExpMatchArray|null) => {
      return pathVariableCapturingTemplate.replace(/{[^}]+}/, match && match[2] ? `(${match[2]})` : '(.+?)');
    }, templateNoTrailingSlash);
    return new Regex(pathVariableCapturingTemplate);
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

  match(against: string) {
    return new RegExp(this.pattern).exec(against)
  }

  *matches(against: string): Iterable<RegExpExecArray | null> {
    const regex = new RegExp(this.pattern, 'g');
    while (this.matched = regex.exec(against)) {
      yield this.matched;
    }
  }
}