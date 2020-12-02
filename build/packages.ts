import * as fs from "fs";

export type Dependencies = { [dep: string]: string };
export type Package = {
    name: string,
    version?: string,
    dependencies: Dependencies,
    devDependencies: Dependencies
};

export function readPackage(path: string): Package {
    const json = JSON.parse(fs.readFileSync(path).toString('utf-8'));
    if (!json.dependencies)
        json.dependencies = {};
    if (!json.devDependencies)
        json.devDependencies = {};
    return json;
}

export function packages(dir: string | undefined = undefined): string[] {
    return fs.readdirSync(dir)
        .reduce(
            (acc: string[], f: string) => {
                if (f === 'node_modules') return acc;
                const fullPath = `${dir}/${f}`;
                if (fs.statSync(fullPath).isDirectory())
                    return [...acc, ...packages(fullPath)]
                if (f === 'package.json')
                    return [...acc, fullPath];
                return acc;
            },
            [] as string[]);
}
