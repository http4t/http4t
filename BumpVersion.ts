import * as fs from 'fs';

type Dependencies = { [dep: string]: string };

function getPackageJson(path: string) {
    return JSON.parse(fs.readFileSync(path).toString('utf-8'));
}

(async function bumpVersion() {
    const write = process.argv.slice(2)[0] === 'write';

    const circleBuildNumber = process.env.CIRCLE_BUILD_NUM;
    const tldPackageJson = getPackageJson('./package.json');
    const localVersionNumber = tldPackageJson.version;
    const majorAndMinorVersion = localVersionNumber.slice(0, localVersionNumber.lastIndexOf('.'));

    const latestVersion = circleBuildNumber ? `${majorAndMinorVersion}.${circleBuildNumber}` : localVersionNumber;
    console.log(`CIRCLE_BUILD_NUM=${circleBuildNumber}`);
    tldPackageJson.version = latestVersion;

    const packages = fs.readdirSync('.').filter(it => it.match(/http4t\-/));
    packages.forEach(pkg => {
        ['', 'src/', 'test/'].forEach(packageJsonDir => {
            const path = `${pkg}/${packageJsonDir}package.json`;
            console.log(`Bumping ${path} to ${latestVersion}`);
            const packageJson = getPackageJson(path);
            packageJson.version = latestVersion;
            const dependencies: Dependencies = packageJson.dependencies;

            if (dependencies) {
                Object.keys(dependencies).forEach((name) => {
                    if (name.match(/@http4t/)) {
                        packageJson.dependencies[name] = latestVersion;
                    }
                })
            }

            if (write) {
                fs.writeFileSync(path, JSON.stringify(packageJson, undefined, 2))
            }
        })

    })
})();