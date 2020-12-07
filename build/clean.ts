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

(async function clean() {
    const targets = files(".", {
        collect: shouldBeCleaned,
        skipDir: path => path.endsWith("/build") || path.endsWith("/node_modules")
    }).sort();
    targets
        .reverse()
        .forEach(path => {
            const stats = fs.statSync(path);
            if (stats.isDirectory()) {
                const thing = fs.rmdirSync as any;
                thing(path, {recursive: true});
            } else if (stats.isFile() || stats.isSymbolicLink()) {
                fs.unlinkSync(path);
            }
        });
})().then(_result => {
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
