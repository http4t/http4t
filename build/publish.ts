import {packages, readPackage} from "./util/packages";
import {spawnPromise} from "./util/processes";

/**
 * Only publishes src modules
 *
 * Create and pushes git tag
 */
(async function publish() {
    const version = readPackage("./package.json").version;
    const tag = `v${version}`;

    console.log(`Publishing ${tag}`);

    await spawnPromise("git", ["tag", tag]);
    await spawnPromise("git", ["push", "origin", tag]);

    // Make sure everything builds before publishing, so we
    // release either all modules or none to npm
    for (const pack of Object.values(packages("packages"))) {
        if (pack.path.endsWith("/test"))
            continue;

        await spawnPromise("yarn", ["run", "build"], pack.path);
    }

    for (const pack of Object.values(packages("packages"))) {
        if (pack.path.endsWith("/test"))
            continue;

        console.log(`Publishing ${pack.package.name} ${pack.package.version}`);

        // Picks up NODE_AUTH_TOKEN set in github action
        await spawnPromise("npm", ["publish", '--access', 'public'], pack.path);
    }
})().then(_result => {
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
