/**
 * JSON parsing error messages are different in browser and node environments, but we need to make assertions in our
 * tests that work in browsers or node.
 */
export function jsonParseError(notJson: string) {
    try {
        JSON.parse(notJson)
    } catch (e: any) {
        return e.message;
    }
    throw new Error(`Expected error when parsing json:\n${notJson}`)
}