import { Regex } from "./regex";
import { Uri } from "./uri";

export type Captures = { [name: string]: string | string[] }

export class UriTemplate {
  private pathTemplate: string;
  private pathVariableCapturingRegexp: Regex;

  constructor(private template: string) {
    this.pathTemplate = this.template;
    this.pathVariableCapturingRegexp = new Regex(`^${this.pathVariableCapturingTemplate()}$`);
  }

  static of(template: string) {
    return new UriTemplate(template)
  }

  matches(uri: Uri | string): boolean {
    const pathNoTrailingSlash = Uri.of(uri).path.replace(/\/$/g, '');
    return this.pathVariableCapturingRegexp.match(pathNoTrailingSlash) !== null
  }

  extract(uri: Uri | string): Captures {
    return this.extractPathCaptures(Uri.of(uri).path.replace(/\/$/g, ''))
  }

  expand(captures: Captures): string {
    return Object.keys(captures).reduce((name, value) => {
      return name.replace(`{${value}}`, encodeURIComponent(captures[value] as string));
    }, this.pathTemplate).replace(/[{}]/g, '')
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

  private pathVariableCapturingTemplate(): string {
    const templateNoTrailingSlash = this.pathTemplate.replace(/\/$/g, '');
    const templateRewritingRegex = new Regex('{([^}]+?)(?::([^}]+))?}');
    const matches = Array.from(templateRewritingRegex.matches(templateNoTrailingSlash));
    return matches.reduce((pathVariableCapturingTemplate: string, match: RegExpMatchArray | null) => {
      const regexCapture = match && match[2];
      return pathVariableCapturingTemplate.replace(/{[^}]+}/, regexCapture ? `(${match![2]})` : '([^\/]+?)');
    }, templateNoTrailingSlash);
  }
}

export function uriTemplate(template: string): UriTemplate {
  return new UriTemplate(template)
}

