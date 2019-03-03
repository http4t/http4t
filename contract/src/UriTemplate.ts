import { Uri } from "./uri";

export type Captures = { [name: string]: string }

export class UriTemplate {
  private pathTemplate: string;
  private queryTemplate?: string;

  constructor(private template: string) {
    const [pathTemplate, queryTemplate] = this.template.split(/{?\?/);

    this.pathTemplate = pathTemplate;
    this.queryTemplate = queryTemplate ? '{' + queryTemplate : undefined
  }

  static of(template: string) {
    return new UriTemplate(template)
  }

  matches(uri: string): boolean {
    const noTrailingSlash = this.pathTemplate.replace(/\/$/g, '');
    const capturingTemplate = noTrailingSlash.replace(new RegExp('{.+}'), '(.+)');
    return new RegExp(capturingTemplate).exec(Uri.parse(uri).path) !== null
  }

  extract(uri: string): Captures {
    const parsedUri = Uri.parse(uri);
    return {
      ...this.extractPathCaptures(parsedUri.path),
      ...this.extractQueryCaptures(parsedUri.query)
    };
  }

  expand(captures: Captures): string {
    return Object.keys(captures).reduce((rebuilt: string, capture: string) => {
      return rebuilt
        .replace(`{${capture}}`, captures[capture].includes('/') ? captures[capture] : encodeURIComponent(captures[capture]))
        .replace(`{?${capture}`, `?${encodeURIComponent(capture)}=${encodeURIComponent(captures[capture])}`) // start query
        .replace(new RegExp(`,${capture}}?`), `&${encodeURIComponent(capture)}=${encodeURIComponent(captures[capture])}`) // middle or end query
    }, this.template).replace(/[{}]/g, '');
  }

  private extractPathCaptures(path: string): Captures {
    const pathParamVariableNames = (this.pathTemplate.match(/{([^}]+)}/g) || []).map(name => name.replace(/[{}]/g, ''));
    const values = new RegExp(this.pathTemplate.replace(/{([^}]+)}/g, '(.+)'), 'g').exec(path);
    return pathParamVariableNames.reduce((captures: Captures, param, index) => {
      captures[param] = decodeURIComponent(values![index + 1]);
      return captures;
    }, {});
  }

  private extractQueryCaptures(query: string | undefined): Captures {
    if (!query || !this.queryTemplate) return {};
    return this.queryTemplate
      .replace(/[?{}]/g, '')
      .split(',')
      .reduce((captures: Captures, queryParameter: string) => {
        const regExpMatchArray = decodeURIComponent(query).match(new RegExp(`${queryParameter}=([^&]+)`));
        if (!regExpMatchArray) return captures;
        captures[queryParameter] = decodeURIComponent(regExpMatchArray[1]);
        return captures;
      }, {});
  }
}