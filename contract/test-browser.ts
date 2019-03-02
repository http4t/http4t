import {FuseBox, WebIndexPlugin} from 'fuse-box';
import {task} from 'fuse-box/sparky';
import {header, ServerHandler} from './src';
import {notFound, ok} from "./src";
import {launch} from 'puppeteer';
import * as fs from 'fs';
import {promisify} from 'util';

task('default', ['test-browser']);

task('bundle', async () => {
    let fuse = FuseBox.init({
        homeDir: '.',
        target: 'browser@es5',
        output: "dist/$name.js",
        sourceMaps: true,
        plugins: [
            WebIndexPlugin({
                path: '.',
                template: 'test/mocha.html',
                target: 'mocha.html'
            })
        ]
    });
    fuse.bundle("tests", "> test/**/*.test.ts");
    await fuse.run();
});

task('test-browser', ['bundle'], async () => {
    const server = new ServerHandler({
        handle: async (request) => {
            const path = '.' + request.uri.path;
            try {
              promisify(fs.readFile)(path);
                let content = await promisify(fs.readFile)(path);
                return ok(content, header("Content-Length", content.length));
            } catch (e) {
                return notFound(e.toString(), header("Content-Length", e.toString().length));
            }
        }
    });

    const browser = await launch({headless: true});

    try {
        const page = await browser.newPage();

        page.on("console", (message) => {
            (async () => {
                const args = await Promise.all(message.args().map(a => a.jsonValue()));
                (console as any)[message.type()](...args);
            })();
        });

        const url = await server.url() + 'dist/mocha.html';
        console.log(url);
        await page.goto(url, {waitUntil: 'load'});

        return await page.evaluate(() => {
            return new Promise((resolved: Function, rejected: Function) => {
                mocha.reporter('spec').run(failures => failures == 0 ? resolved("SUCCESS") : rejected("FAILED: " + failures))
            });
        });

    } finally {
        await browser.close();
        await server.close();
    }
});


