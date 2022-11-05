import {context, getOctokit} from '@actions/github';
import * as fs from "fs";
import {packages, readPackage} from "./util/packages";
import {spawnPromise} from "./util/processes";

/**
 * Only publishes src modules
 *
 * Create and pushes git tag
 */
(async function publish() {
    if (!process.env.NODE_AUTH_TOKEN)
        throw new Error("$NODE_AUTH_TOKEN was not set");
    if (!process.env.GITHUB_TOKEN)
        throw new Error("$GITHUB_TOKEN was not set");

    const version = readPackage("./package.json").version;
    const tag = `v${version}`;
    const github = getOctokit(process.env.GITHUB_TOKEN)
    const {owner, repo} = context.repo;

    console.log(`Publishing ${tag}`);

    // Make sure everything builds before publishing, so we
    // release either all modules or none to npm
    for (const pack of Object.values(packages("packages"))) {
        if (pack.path.endsWith("/test"))
            continue;

        const json = pack.package;
        delete json["type"];
        fs.writeFileSync(`${pack.path}/package.json`, JSON.stringify(json, null, 2))

        await spawnPromise("yarn", ["run", "build"], pack.path);
    }

    await github.repos.createRelease({
        owner,
        repo,
        tag_name: tag,
        body: tag,
        target_commitish: context.sha
    })

    for (const pack of Object.values(packages("packages"))) {
        if (pack.path.endsWith("/test"))
            continue;

        console.log(`Publishing ${pack.package.name} ${pack.package.version}`);

        // Picks up NODE_AUTH_TOKEN set in github action
        await spawnPromise("yarn", ["publish", '--access', 'public', pack.path]);
    }
})().then(_result => {
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});DockerPgTransactionPool
