import * as fs from 'fs';
import {Dependencies, packages, readPackage} from "./packages";

/**
 * Updates package.json version with build number
 *
 * Pass build number as first parameter
 */

/**
 * Updates @http4t/* dependencies to the correct version
 */
function fixDependencies(dependencies: Dependencies | undefined, version: string) {
    if (!dependencies) return;
    Object.keys(dependencies)
        .map(k => {
            if (k.startsWith("@http4t/")) {
                dependencies[k] = version;
            }
        });
}

(async function setVersion() {
    const args = process.argv.slice(2);
    const buildNumber = args[0];
    const write = args[1] === 'write';

    if (!buildNumber)
        throw new Error("First argument should be build number");

    const version = readPackage("./package.json").version.replace(/\.[^.]+$/, `.${buildNumber}`);

    Object.values(packages("packages"))
        .forEach(pack => {
            const json = pack.package;
            json.version = version;
            fixDependencies(json.dependencies, version);
            fixDependencies(json.devDependencies, version);
            if (write) {
                fs.writeFileSync(pack.path, JSON.stringify(json, null, 2))
            } else {
                console.log(pack.path, json);
            }
        })
    console.log(version);
})().then(_result => {
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
;
