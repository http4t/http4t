import { expect } from "chai";

class UriTemplate {
  constructor(private template: string) {
  }

  static of(template: string) {
    return new UriTemplate(template)
  }

  matches(against: string): boolean {
    return this.matchesPath(against) && this.matchesQuery(against);
  }

  private matchesPath(against: string): boolean {
    const pathTemplate = this.template.split('?')[0];
    return new RegExp(pathTemplate.replace('{', '(').replace('}', ')'))
      .exec(against) !== null;
  }

  private matchesQuery(against: string): boolean {
    const queryTemplate = this.template.split('?')[1];
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
    const ofuriTemplate = UriTemplate.of('/part/{capture}/part');

    expect(ofuriTemplate.matches('/doesnt/match')).eq(false);
    expect(ofuriTemplate.matches('/part/capture/part')).eq(true);
  });

  it("matches query or not", () => {
    const ofuriTemplate = UriTemplate.of('/part/{capture}/part?{query1,query2}');

    expect(ofuriTemplate.matches('/part/capture/part?query1=value1')).eq(false);
    expect(ofuriTemplate.matches('/part/capture/part?query1=value1&query2=value2')).eq(true);
  })
});

