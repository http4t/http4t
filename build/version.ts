import * as fs from 'fs';
import {Dependencies, readPackage, packages} from "./packages";

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

    const version = readPackage("./package.json").version.replace(/0$/, buildNumber);

    packages(".")
        .filter(path => path.startsWith("./http4t-"))
        .forEach(path => {
            const json = readPackage(path);
            json.version = version;
            fixDependencies(json.dependencies, version);
            fixDependencies(json.devDependencies, version);
            if (write) {
                fs.writeFileSync(path, JSON.stringify(json, null, 2))
            } else {
                console.log(path, json);
            }
        })
})();
