import { Uri } from "./uri";

export type Captures = { [name: string]: string }

export class UriTemplate {
  private pathTemplate: string;
  private queryTemplate: string;

  constructor(private template: string) {
    const [pathTemplate, queryTemplate] = this.template
      .replace(/\/\?/, '?').replace(/\/$/, '') // remove trailing slash
      .replace('{?', '?{').split('?'); // swap {? cos conforming to RFC is annoying for implementation

    this.pathTemplate = pathTemplate;
    this.queryTemplate = queryTemplate;
  }

  static of(template: string) {
    return new UriTemplate(template)
  }

  matches(against: string): boolean {
    const uri = Uri.parse(against);
    return this.matchesPath(uri.path) && this.matchesQuery(uri.query);
  }

  extract(from: string): Captures {
    const uri = Uri.parse(from);
    return {
      ...this.extractPathCaptures(uri.path),
      ...this.extractQueryCaptures(uri.query)
    };
  }

  uriFrom(captures: Captures): string {
    return Object.keys(captures).reduce((rebuilt: string, capture: string) => {
      return rebuilt
        .replace(`{${capture}}`, captures[capture])
        .replace(`{?${capture}`, `?${encodeURIComponent(capture)}=${encodeURIComponent(captures[capture])}`) // start query
        .replace(new RegExp(`,${capture}}?`), `&${encodeURIComponent(capture)}=${encodeURIComponent(captures[capture])}`) // middle or end query
    }, this.template).replace(/[{}]/g, '');
  }

  private extractQueryCaptures(query: string | undefined): Captures {
    if (!query) return {};
    return this.queryTemplate
      .replace(/[{}]/g, '')
      .split(',')
      .reduce((captures: Captures, queryParameter: string) => {
        const regExpMatchArray = decodeURIComponent(query).match(new RegExp(`${queryParameter}=([^&]+)`));
        if (!regExpMatchArray) return captures;
        captures[queryParameter] = decodeURIComponent(regExpMatchArray[1]);
        return captures;
      }, {});
  }

  private extractPathCaptures(path: string): Captures {
    const pathParamVariableNames = (this.pathTemplate.match(/{([^}]+)}/g) || []).map(name => name.replace(/[{}]/g, ''));
    const values = new RegExp(this.pathTemplate.replace(/{([^}]+)}/g, '(.+)'), 'g').exec(path);
    return pathParamVariableNames.reduce((captures: Captures, param, index) => {
      captures[param] = values![index + 1];
      return captures;
    }, {});
  }

  private matchesPath(path: string): boolean {
    return new RegExp(this.pathTemplate.replace(/[{}]/g, '')).exec(path) !== null;
  }

  private matchesQuery(against: string | undefined): boolean {
    if (!against || !this.queryTemplate) return true;
    const captureGroup = new RegExp('\{([^\\}]+)\}').exec(this.queryTemplate);
    return captureGroup![1].split(',').every(match => against.includes(match))
  }
}