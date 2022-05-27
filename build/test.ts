import {packages, Packages} from "./util/packages";
import {spawnPromise} from "./util/processes";
import {clean} from "./clean";

(async function test() {
    const args = process.argv.slice(2);
    const types = new Set(args.slice(0, 1)[0].split(","));
    const dirs = args.slice(1);
    console.log(`Running test types [${args.slice(0, 1)[0].split(",")}] for directories [${dirs.join(", ")}]`)

    const modules = dirs.reduce(
        (packs, dir) => {
            return {...packs, ...packages("packages")};
        }, {} as Packages)

    for (const module of Object.values(modules)) {
        console.log(module.package.name);
        console.log(module.path);

        const cwd = module.path;

        if (cwd.endsWith("/test")) {
            // Delete tsc artifacts because I don't have time to understand how to get this to work:
            // https://stackoverflow.com/questions/64261239/mocha-tests-with-esm-support-for-native-es6-modules
            // await clean(cwd);
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
