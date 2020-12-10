import {packages, Packages} from "./util/packages";
import {spawnPromise} from "./util/processes";

(async function test() {
    const args = process.argv.slice(2);
    const types = new Set(args.slice(0, 1)[0].split(","));
    const dirs = args.slice(1);

    const modules = dirs.reduce(
        (packs, dir) => {
            return {...packs, ...packages("packages")};
        }, {} as Packages)

    for (const module of Object.values(modules)) {
        console.log(module.package.name);
        console.log(module.path);

        const cwd = module.path;

        if (cwd.endsWith("/test")) {
            if (types.has("node")) await spawnPromise("yarn", ["run", "test"], cwd);
            if (types.has("browser")) await spawnPromise("yarn", ["run", "test:browser"], cwd);
        }
    }
})().then(_result => {
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
