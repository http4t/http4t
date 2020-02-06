import {expect} from 'chai';
import {failure, problem} from "../src";
import {ResultError} from "../src/ResultError";

describe('ResultError', () => {
  it('fails with an AssertionError with expected, actual and showDiff=true', () => {
    const actual = 'incorrect';

    const problems = [
      problem("value was incorrect", []),
    ];

    const e = new ResultError(actual, failure(...problems), {leakActualValuesInError: true});

    expect(e.message).contains('value was incorrect');

    expect(e.showDiff).eq(true);

    expect(e.actual).deep.eq('incorrect');
    expect(e.expected).deep.eq('value was incorrect');
  });

  describe('intertwingling', () => {
    it('undefined', () => {
      const actual = undefined;

      const problems = [
        problem("value was incorrect", []),
      ];

      const e = new ResultError(actual, failure(...problems), {leakActualValuesInError: true});

      expect(e.actual).deep.eq(actual);
      expect(e.expected).deep.eq('value was incorrect');
    });

    it('undefined in an array', () => {
      const actual = [undefined, undefined];

      const problems = [
        problem("value was incorrect", [1]),
      ];

      const e = new ResultError(actual, failure(...problems), {leakActualValuesInError: true});

      expect(e.actual).deep.eq(actual);
      expect(e.expected).deep.eq([undefined, 'value was incorrect']);
    });

    it('arrays', () => {
      const actual = [
        'right',
        'right',
        'incorrect'];

      const problems = [
        problem("value was incorrect", [2]),
      ];

      const e = new ResultError(actual, failure(...problems), {leakActualValuesInError: true});

      expect(e.actual).deep.eq(actual);
      expect(e.expected).deep.eq(
        [
          'right',
          'right',
          'value was incorrect'
        ]);
    });

    it('nested object in array', () => {
      const actual = [
        'right',
        'right',
        {wrong: 'incorrect'},
        'right'];

      const problems = [
        problem("value was incorrect", [2, 'wrong']),
      ];

      const e = new ResultError(actual, failure(...problems), {leakActualValuesInError: true});

      expect(e.actual).deep.eq(actual);
      expect(e.expected).deep.eq(
        [
          'right',
          'right',
          {wrong: 'value was incorrect'},
          'right',
        ]);
    });

    it('nested object in object', () => {
      const actual = {nested: {wrong: 'incorrect'}};

      const problems = [
        problem("value was incorrect", ['nested', 'wrong']),
      ];

      const e = new ResultError(actual, failure(...problems), {leakActualValuesInError: true});

      expect(e.actual).deep.eq(actual);
      expect(e.expected).deep.eq({nested: {wrong: 'value was incorrect'}});
    });

    it('nested array in object', () => {
      const actual = {nested: ['right', 'incorrect', 'right']};

      const problems = [
        problem("value was incorrect", ['nested', 1]),
      ];

      const e = new ResultError(actual, failure(...problems), {leakActualValuesInError: true});

      expect(e.actual).deep.eq(actual);
      expect(e.expected).deep.eq({nested: ['right', 'value was incorrect', 'right']});
    });

    it('adds problems to nested values', () => {
      const actual = [
        'right',
        'right',
        'incorrect'];

      const problems = [
        problem("value was incorrect", [2]),
      ];

      const e = new ResultError(actual, failure(...problems), {leakActualValuesInError: true});

      expect(e.actual).deep.eq(actual);
      expect(e.expected).deep.eq(
        [
          'right',
          'right',
          'value was incorrect'
        ]);
    });
  });
});