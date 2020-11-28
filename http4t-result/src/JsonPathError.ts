import {JsonPath, pathsEq, pathStartsWith, Problem, Problems} from "./JsonPathResult";

export function isPrimitive(value: any): boolean {
    return (typeof value !== 'object' && typeof value !== 'function') || value === null
}

/**
 * @param actual the actual value, which may be the root object (if pathToActual is []), or some field value or array item
 *               within the root
 * @param rootObjectProblems all problems for the root object that actual is part of
 * @param pathToActual the path to actual, relative to the root object (or [] if actual is the root object)
 */
function intertwingledValue(actual: any, rootObjectProblems: Readonly<Problem[]>, pathToActual: JsonPath): any {
    if (isPrimitive(actual))
        return actual;

    const actualKeys: Set<string | number> = Array.isArray(actual)
        ? [...new Array(actual.length).keys()].reduce((set: Set<number>, _, i) => set.add(i), new Set<number>())
        : new Set(Object.keys(actual));

    // Keys that appear in a problems path, but aren't in actual.
    const missingKeys = rootObjectProblems
        .filter(problem =>
            // problems for direct children of path (but not ancestors)
            problem.path.length === pathToActual.length + 1
            && pathStartsWith(problem.path, pathToActual)

            // ...that are not in actual
            && !actualKeys.has(problem.path[problem.path.length - 1]))
        .map(p => p.path[p.path.length - 1]);

    return [...actualKeys, ...missingKeys]
        .reduce((result: any, k) => {
            result[k] = intertwingle(actual[k], rootObjectProblems, [...pathToActual, k]);
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
 *
 * @param actual the actual value, which may be the root object (if pathToActual is []), or some field value or array item
 *               within the root
 * @param rootObjectProblems all problems for the root object that actual is part of
 * @param pathToActual the path to actual, relative to the root object (or [] if actual is the root object)
 */
export function intertwingle(actual: any, rootObjectProblems: Readonly<Problem[]>, pathToActual: JsonPath = []): any {

    // TODO: optimise this by indexing problems
    const myProblems = rootObjectProblems
        .filter(p => pathsEq(pathToActual, p.path))
        .map(p => p.message);

    return myProblems.length === 0
        ? intertwingledValue(actual, rootObjectProblems, pathToActual)
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
export class JsonPathError extends Error {
    public readonly actual?: any;
    public readonly expected?: any;
    public readonly showDiff: boolean;

    constructor(
        actual: any,
        public readonly problems: Problems,
        {
            message = 'Validation failed',
            leakActualValuesInError = false,
        }: Partial<ResultErrorOpts> = {}
    ) {
        super(`${message}:\n${problems.join("\n")}${leakActualValuesInError ? `\n\nactual:${JSON.stringify(actual, null, 2)}\n` : ''}`);
        if (!leakActualValuesInError) {
            this.showDiff = false;
        }
        // tells mocha to show diff
        this.showDiff = true;
        this.actual = actual;
        this.problems = problems;
        this.expected = intertwingle(actual, problems, []);
    }
}
