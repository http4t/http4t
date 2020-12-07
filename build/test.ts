import {dependencyOrder} from "./util/graph";
import {packages, Packages} from "./util/packages";
import {spawnPromise} from "./util/processes";

/**
 * For some reason installing other yarn workspaces does not reliably
 * create the `puppet` command in `node_modules/bin`, whereas linking
 * works consistently.
 *
 * yarn v2 workspace: dependencies might fix this.
 */
async function linkMochaPuppeteer(modules: Packages, install: boolean) {
    const mochaPuppeteer = modules["@http4t/mocha-puppeteer"];
    if (install) await spawnPromise("yarn", ["link"], mochaPuppeteer.path)
}

(async function test() {
    const modules = {
        ...packages("packages"),
        ...packages("examples")
    };

    for (const name of dependencyOrder(modules)) {
        const module = modules[name];
        console.log(name);
        console.log(module.path);
        const cwd = module.path;

        if (cwd.endsWith("/test")) {
            await spawnPromise("yarn", ["run", "test"], cwd);
            await spawnPromise("yarn", ["run", "test:browser"], cwd);
        }
    }
})().then(_result => {
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
