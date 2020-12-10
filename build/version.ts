import * as fs from 'fs';
import {Dependencies, PackageFile, packages, readPackage} from "./util/packages";

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

function fixVersion(pack: PackageFile, version: string) {
    const json = pack.package;
    json.version = version;
    fixDependencies(json.dependencies, version);
    fixDependencies(json.devDependencies, version);

    fs.writeFileSync(`${pack.path}/package.json`, JSON.stringify(json, null, 2))
}

(async function setVersion() {
    const args = process.argv.slice(2);
    const buildNumber = args[0];

    if (!buildNumber)
        throw new Error("First argument should be build number");

    const root = readPackage("./package.json");
    const version = root.version.replace(/\.[^.]+$/, `.${buildNumber}`);
    console.log(`Version ${version}`);

    fixVersion(
        {path: "./package.json", package: root},
        version)

    Object.values(packages("packages"))
        .forEach(pack => {
            fixVersion(pack, version);
        })
    console.log(version);
})().then(_result => {
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
