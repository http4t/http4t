import {packages} from "./util/packages";
import {spawnPromise} from "./util/processes";

(async function build() {
    const allPackages = Object.assign({},
        packages("examples"),
        packages("packages"));
    for (const pkg of Object.values(allPackages)) {
        if (pkg.path.endsWith("/test"))
            continue;
        console.log(`Building ${pkg.path}`);
        await spawnPromise("yarn", ["run", "build"], pkg.path);
    }


})().then(_result => {
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
