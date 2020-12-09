import {dependencyOrder} from "./util/graph";
import {packages, Packages} from "./util/packages";
import {spawnPromise} from "./util/processes";

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
