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
    this.pathVariableCapturingRegexp = this.makeCapturingTemplate();
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
    return Object.keys(captures).reduce((rebuilt: string, capture: string) => {
      return rebuilt.replace(
        `{${capture}}`,
        captures[capture].includes('/') ? captures[capture] : encodeURIComponent(captures[capture]))
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
      .filter(it => !!it)
      .join('&');
  }

  private makeCapturingTemplate(): RegExp {
    const noTrailingSlash = this.pathTemplate.replace(/\/$/g, '');
    let match, pathCapturingTemplate = noTrailingSlash;
    const pathVariables = new RegExp('{([^}]+?)(?::([^}]+))?}', 'g');
    while (match = pathVariables.exec(noTrailingSlash)) {
      pathCapturingTemplate = pathCapturingTemplate.replace(/{[^}]+}/, match[2] ? `(${match[2]})` : '(.+?)');
    }
    return new RegExp(pathCapturingTemplate);
  }
}