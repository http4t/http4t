import {spawn} from 'child_process';
import {Package, packages, readPackage} from "./packages";

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

(async function build() {
    const modules = packages(".")
        .reduce((acc, path) => {
            const pack = readPackage(path);
            if (ignored.has(pack.name))
                return acc;
            const dir = path.replace(/\/package.json/, "");
            acc[pack.name] = {path: dir, package: pack};
            return acc;
        }, {} as Packages);
    const graph = buildGraph(modules);

    for (const name of topological(graph)) {
        const module = modules[name];
        console.log(name);
        console.log(module.path);
        const cwd = module.path;
        await spawnPromise("tsc", [], cwd);
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
