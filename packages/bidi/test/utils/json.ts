/**
 * JSON parsing errors are different in browser and node environments
 */
export function jsonParseError(notJson: string) {
    try {
        JSON.parse(notJson)
    } catch (e: any) {
        return e.message;
    }
    throw new Error(`Expected error when parsing json:\n${notJson}`)
}