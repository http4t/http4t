import {Regex} from "./regex";
import {Uri} from "./uri";

export type Captures = { [name: string]: string | string[] }

function ensureArray<T>(value: T | T[]): T[] {
  return value instanceof Array ? value : [value];

}

export class UriTemplatee {
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
    return new UriTemplatee(template)
  }

  matches(uri: Uri | string): boolean {
    return this.pathVariableCapturingRegexp.match(Uri.of(uri).path) !== null
  }

  extract(uri: Uri | string): Captures {
    const parsedUri = Uri.of(uri);
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
    return Object.keys(captures)
      .reduce(
        (name, value) => name.replace(`{${value}}`, encodeURIComponent(captures[value] as string)),
        this.pathTemplate)
      .replace(/[{}]/g, '');
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
      .map(name => {
        if (captures[name] === undefined) return undefined;
        return ensureArray(captures[name])
          .map(value => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
          .join('&');
      })
      .filter(it => it !== undefined)
      .join('&');
  }

  private pathVariableCapturingTemplate(): Regex {
    const templateNoTrailingSlash = this.pathTemplate.replace(/\/$/g, '');
    const templateRewritingRegex = new Regex('{([^}]+?)(?::([^}]+))?}');
    const matches = Array.from(templateRewritingRegex.matches(templateNoTrailingSlash));
    const pathVariableCapturingTemplate = matches.reduce((pathVariableCapturingTemplate: string, match: RegExpMatchArray | null) => {
      return pathVariableCapturingTemplate.replace(/{[^}]+}/, match && match[2] ? `(${match[2]})` : '(.+?)');
    }, templateNoTrailingSlash);
    return new Regex(pathVariableCapturingTemplate);
  }
}

export function uriTemplate(template: string): UriTemplatee {
  return new UriTemplatee(template)
}

