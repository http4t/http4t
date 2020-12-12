import {context, getOctokit} from '@actions/github';
import {packages, readPackage} from "./util/packages";
import {spawnPromise} from "./util/processes";

(async function build() {
    for (const pack of Object.values(packages("packages"))) {
        if (pack.path.endsWith("/test"))
            continue;

        console.log(`Building ${pack.path}`);
        await spawnPromise("yarn", ["run", "build"], pack.path);
    }


})().then(_result => {
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
