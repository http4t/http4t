import {spawn} from 'child_process';
import {Package, packages, readPackage} from "./packages";

/**
 * Builds all modules
 *
 * Responsibilities:
 *
 * - Find all modules by `package.json` file
 * - Figure out topological order of projects by dependency so we build dependencies first
 * - For each module:
 *   - yarn install
 *   - Link mocha-puppeteer into the projects that need it, because installing it doesn't work
 *   - Compile typescript
 *   - yarn test
 *   - yarn test:browser
 */

type Edges = { [node: string]: Set<string> };
type Graph = {
    nodes: string[],
    edges: Edges,
    reverseEdges: Edges,
    roots: Set<string>
}
type Packages = {
    [name: string]: {
        path: string,
        package: Package
    }
}

function buildGraph(packages: Packages): Graph {
    return Object.entries(packages)
        .reduce((graph, module) => {
            const pack = module[1].package;
            const deps = new Set([
                ...Object.keys(pack.dependencies),
                ...Object.keys(pack.devDependencies)]
                .filter(k => k.startsWith("@http4t/")));

            graph.nodes.push(pack.name);
            graph.edges[pack.name] = deps;
            graph.reverseEdges[pack.name] = graph.reverseEdges[pack.name] || new Set();
            deps.forEach(dep => {
                const existing = graph.reverseEdges[dep] || new Set();
                graph.reverseEdges[dep] = existing.add(pack.name)
            })
            if (deps.size === 0) {
                graph.roots.add(pack.name);
            }
            return graph;
        }, {nodes: [], edges: {}, reverseEdges: {}, roots: new Set<string>()} as Graph);
}

function topological(graph: Graph): string[] {
    const sorted: string[] = [];
    const roots = Array.from(graph.roots);
    const reverseEdges: Edges = Object.assign({}, graph.reverseEdges);
    while (roots.length !== 0) {
        const root = roots.pop();
        sorted.push(root);
        const deps = reverseEdges[root];
        delete reverseEdges[root];
        const depsWithNoIncoming = Array.from(deps)
            .filter(dep => !Object.values(reverseEdges).find(to => to.has(dep)));
        roots.push(...depsWithNoIncoming)
    }
    if (Object.keys(reverseEdges).length !== 0) {
        throw new Error(`Circular dependency involving ${Object.keys(reverseEdges).join(", ")}`);
    }
    return sorted;
}

/**
 * Spawns a process
 * pipes stderr/stdout
 * Resolves or rejects promise on completion
 */
function spawnPromise(command: string, args: string[], cwd: string) {
    console.log(`${command} ${args.join(" ")}`);
    const test = spawn(command, args, {cwd});
    test.stderr.pipe(process.stderr);
    test.stdout.pipe(process.stdout);
    return new Promise((resolve, reject) => {
        test.on("exit", (code: number | null) => {
            if (code == 0) {
                resolve(code);
            } else {
                reject(code);
            }
        })
    });
}

const ignored = new Set(["@http4t/root", "@http4t/site"]);

/**
 * For some reason installing other yarn workspaces does not reliably
 * create the `puppet` command in `node_modules/bin`, whereas linking
 * works consistently.
 */
async function linkMochaPuppeteer(modules: Packages, install: boolean) {
    const mochaPuppeteer = modules["@http4t/mocha-puppeteer"];
    if (install) await spawnPromise("yarn", ["link"], mochaPuppeteer.path)
}

(async function build() {
    const args = process.argv.slice(2);
    const install = args[0] === 'install';

    const modules = packages(".")
        .reduce(
            (acc, path) => {
                const pack = readPackage(path);
                if (ignored.has(pack.name))
                    return acc;
                const dir = path.replace(/\/package.json/, "");
                acc[pack.name] = {path: dir, package: pack};
                return acc;
            },
            {} as Packages);

    if(install) await linkMochaPuppeteer(modules, install);

    const graph = buildGraph(modules);

    for (const name of topological(graph)) {
        const module = modules[name];
        console.log(name);
        console.log(module.path);
        const cwd = module.path;

        if (install) {
            await spawnPromise("yarn", ["install"], cwd);

            // See linkMochaPuppeteer
            if (module.package.devDependencies["@http4t/mocha-puppeteer"]
                || module.package.dependencies["@http4t/mocha-puppeteer"]) {
                await spawnPromise("yarn", ["link", "@http4t/mocha-puppeteer"], cwd);
            }
        }

        await spawnPromise("yarn", ["build"], cwd);
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
