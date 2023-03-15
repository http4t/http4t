import * as fs from "fs";
import {files} from "./util/packages";

const patterns = [
    /.*\/dist(\/.*|$)/,
    /.*\/out(\/.*|$)/,
    /.*\/.cache(\/.*|$)/,
    /\.js$/,
    /\.map$/,
    /\.d.ts$/,
    /\.log$/,
    /\.tsbuildinfo$/,
    /\/mocha.html$/,
];
const shouldBeCleaned = path => !!patterns.find(regex => regex.test(path));

export async function clean(dir: string = ".") {
    const targets = files(dir, {
        collect: shouldBeCleaned,
        skipDir: path => path.endsWith("/build") || path.endsWith("/node_modules")
    }).sort();
    targets
        .reverse()
        .forEach(path => {
            const stats = fs.statSync(path);
            if (stats.isDirectory()) {
                fs.rmSync(path, {recursive: true});
            } else if (stats.isFile() || stats.isSymbolicLink()) {
                fs.unlinkSync(path);
            }
        });
}

clean().then(_result => {
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
