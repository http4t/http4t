import * as fs from "fs";

export type Dependencies = { [dep: string]: string };
export type Package = {
    name: string,
    version?: string,
    dependencies: Dependencies,
    devDependencies: Dependencies
    scripts?:Record<string,string>
};
export type PackageFile = {
    path: string,
    package: Package
};
export type Packages = {
    [name: string]: PackageFile
}

export function readPackage(path: string): Package {
    const json = JSON.parse(fs.readFileSync(path).toString('utf-8'));
    if (!json.dependencies)
        json.dependencies = {};
    if (!json.devDependencies)
        json.devDependencies = {};
    return json;
}

export type FilesOpts = {
    skipDir: (fullPath: string) => boolean,
    collect: (fullPath: string) => boolean
}

export function files(dir: string, opts: Partial<FilesOpts> = {}): string[] {
    const {skipDir = () => false, collect = () => true} = opts;
    return fs.readdirSync(dir)
        .reduce(
            (acc: string[], f: string) => {
                const fullPath = `${dir}/${f}`;
                const result = collect(fullPath) ? [...acc, fullPath] : acc;
                if (fs.statSync(fullPath).isDirectory() && !skipDir(fullPath)) {
                    return [...result, ...files(fullPath, opts)]
                } else {
                    return result;
                }
            },
            [] as string[]);
}

export function packageFiles(dir: string = "."): string[] {
    return files(dir,
        {
            skipDir: path => path.endsWith('/node_modules'),
            collect: path => path.endsWith('/package.json')
        }
    );
}

export function packages(dir: string = "."): Packages {
    const files = packageFiles(dir);
    // console.log(`Found package files in ${dir}:\n   ${files.join("\n   ")}`)
    return files
        .reduce(
            (acc, path) => {
                const pack = readPackage(path);
                const dir = path.replace(/\/package.json/, "");
                acc[pack.name] = {path: dir, package: pack};
                return acc;
            },
            {} as Packages)
}
