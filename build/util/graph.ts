import {Packages} from "./packages";

type Edges = { [node: string]: Set<string> };
type Graph = {
    nodes: string[],
    edges: Edges,
    reverseEdges: Edges,
    roots: Set<string>
}

export function buildGraph(packages: Packages): Graph {
    const names = new Set(Object.keys(packages));
    return Object.entries(packages)
        .reduce((graph, module) => {
            const pack = module[1].package;
            const deps = new Set([
                ...Object.keys(pack.dependencies),
                ...Object.keys(pack.devDependencies)]
                .filter(k => names.has(k)));

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

export function topological(graph: Graph): string[] {
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

export function dependencyOrder(packages:Packages): string[] {
    return topological(buildGraph(packages));
}
