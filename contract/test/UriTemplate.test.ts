import { expect } from "chai";
import { Uri } from "../src/uri";


export type Captures = { [name: string]: string }

export class UriTemplate {
  private adjustedTemplate: string;

  constructor(private template: string) {
    this.adjustedTemplate = this.template.replace('{?', '?{')
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
    const pathCaptures = this.extractPathCaptures(uri.path);
    const queryCaptures = this.extractQueryCaptures(uri.query);
    return {
      ...pathCaptures,
      ...queryCaptures
    };
  }

  private extractQueryCaptures(query: string | undefined): Captures {
    if (!query) return {};
    return this.adjustedTemplate.split('?')[1]
      .replace(/[{}]/g, '')
      .split(',')
      .reduce((captures: Captures, queryParameter) => {
        const regExpMatchArray = query.match(new RegExp(`${queryParameter}=([^&]+)`));
        captures[queryParameter] = regExpMatchArray![1];
        return captures;
      }, {});
  }

  private extractPathCaptures(path: string): Captures {
    const pathTemplate = this.adjustedTemplate.split('?')[0];
    const pathParamVariableNames = (pathTemplate.match(/{([^}]+)}/g) || []).map(name => name.replace(/[{}]/g, ''));
    const values = new RegExp(pathTemplate.replace(/{([^}]+)}/g, '([^\/]+)'), 'g').exec(path);
    return pathParamVariableNames.reduce((captures: Captures, param, index) => {
      captures[param] = values![index + 1];
      return captures;
    }, {});
  }

  private matchesPath(against: string): boolean {
    const pathTemplate = this.adjustedTemplate.split('?')[0];
    return new RegExp(pathTemplate.replace('{', '(').replace('}', ')'))
      .exec(against) !== null;
  }

  private matchesQuery(against: string | undefined): boolean {
    if (!against) return true;
    const queryTemplate = '{' + this.template.split('?')[1];
    if (queryTemplate) {
      const captureGroup = new RegExp('\{([^\\}]+)\}').exec(queryTemplate);
      if (captureGroup) {
        return captureGroup[1].split(',').every(match => against.includes(match))
      }
    }
    return true;
  }
}

describe('UriTemplate', () => {
  it('matches paths or not', () => {
    const uriTemplate = UriTemplate.of('/part/{capture}/part');

    expect(uriTemplate.matches('/doesnt/match')).eq(false);
    expect(uriTemplate.matches('/part/capture/part')).eq(true);
    expect(uriTemplate.matches('/part/capture/part/')).eq(true);
  });

  it('matches query or not', () => {
    const uriTemplate = UriTemplate.of('/part/{capture}/part{?query1,query2}');

    expect(uriTemplate.matches('/part/capture/part?query1=value1')).eq(false);
    expect(uriTemplate.matches('/part/capture/part?query1=value1&query2=value2')).eq(true);
  });

  it('extract captures', () => {
    const uriTemplate = UriTemplate.of('/part/{capture1}/{capture2}/part{?query1,query2}');

    expect(uriTemplate.extract('/part/one/two/part?query1=value1&query2=value2&query3=value3')).eql({
      capture1: 'one',
      capture2: 'two',
      query1: 'value1',
      query2: 'value2'
    });
  });

});

