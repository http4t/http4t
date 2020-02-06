import {Failure, JsonPath, pathsEq, pathStartsWith, Problem} from "./index";

export function isPrimitive(value: any): boolean {
  return (typeof value !== 'object' && typeof value !== 'function') || value === null
}

function intertwingledValue<T>(actual: any, problems: Readonly<Problem[]>, path: JsonPath): any {
  if (isPrimitive(actual))
    return actual;

  const actualKeys: Set<string | number> = Array.isArray(actual)
    ? [...new Array(actual.length).keys()].reduce((set: Set<number>, _, i) => set.add(i), new Set<number>())
    : new Set(Object.keys(actual));

  // Keys that appear in a problems path, but aren't in actual.
  const missingKeys = problems
    .filter(problem =>
      // problems for direct children of path (but not ancestors)
      problem.path.length === path.length + 1
      && pathStartsWith(problem.path, path)

      // ...that are not in actual
      && !actualKeys.has(problem.path[problem.path.length - 1]))
    .map(p => p.path[p.path.length - 1]);

  return [...actualKeys, ...missingKeys]
    .reduce((result: any, k) => {
      result[k] = intertwingle(actual[k], problems, [...path, k]);
      return result;
    }, Array.isArray(actual) ? [] : {});
}

/**
 * Returns an object in the same shape as actual, but with all invalid values
 * replaced with an error report.
 *
 * e.g.
 *
 * const actual = {right: 'right', wrong:'wrong'};
 * const problems = [{path: ['wrong'], message: 'error message'};
 * intertwingle(actual, problems);
 *
 * will return
 *
 * {right: 'right', wrong: {value: 'wrong', errors: ['error message']}}
 *
 * This is suitable for a structural diff with the actual value, where only
 * problem fields will be mismatches. For example, when an intertwingled object
 * is used as "expected" in a thrown ResultError, IntelliJ/WebStorm will
 * display a nice diff in test failures, based on `error.expected` and
 * `error.actual`.
 */
export function intertwingle(actual: any, problems: Readonly<Problem[]>, path: JsonPath = []): any {

  const myProblems = problems
    .filter(p => pathsEq(path, p.path))
    .map(p => p.message);

  return myProblems.length === 0
    ? intertwingledValue(actual, problems, path)
    : myProblems.length === 1
      ? myProblems[0]
      : myProblems;
}

export type ResultErrorOpts = {
  /**
   * Prefix to error message
   */
  message: string,
  /**
   * If this is set to false,
   */
  leakActualValuesInError: boolean
};

/**
 * An error with an easily human-readable (multi-line!) message listing all problems.
 *
 * If leakActualValuesInError===true in opts, will also create actual and expected fields,
 * compatible with mocha's diff functionality on errors, and which work nicely with
 * IntelliJ/Webstorm's diff viewer in the test runner.
 */
export class ResultError extends Error {
  public readonly actual?: any;
  public readonly expected?: any;
  public readonly showDiff: boolean;

  constructor(actual: any,
              public readonly failure: Failure,
              {
                message = 'Validation failed',
                leakActualValuesInError = false,
              }: Partial<ResultErrorOpts> = {}
  ) {
    super(`${message}:\n${failure}${leakActualValuesInError ? `\nactual:${JSON.stringify(actual, null, 2)}\n` : ''}`);
    if (!leakActualValuesInError) {
      this.showDiff = false;
    }
    // tells mocha to show diff
    this.showDiff = true;
    this.actual = actual;
    this.expected = intertwingle(actual, failure.problems, []);
  }
}