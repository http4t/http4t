import {packages, Packages} from "./util/packages";
import {spawnPromise} from "./util/processes";

(async function delegate() {
    const args = process.argv.slice(2);
    const commands = args.slice(0, 1)[0].split(",");
    const dirs = args.slice(1);
    console.log(`Running [${args.slice(0, 1)[0].split(",")}] for directories [${dirs.join(", ")}]`)

    const modules = dirs.reduce(
        (packs, dir) => {
            return {...packs, ...packages(dir)};
        }, {} as Packages)

    for (const module of Object.values(modules)) {
        console.log(module.package.name);
        console.log(module.path);

        const cwd = module.path;

        for (const command of commands) {
            if (command in module.package.scripts) await spawnPromise("yarn", ["run", command], cwd)
        }
    }
})().then(_result => {
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
