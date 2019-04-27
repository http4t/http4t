import * as fs from 'fs';
import { execSync } from 'child_process';

function getPackageJson(path: string) {
  return JSON.parse(fs.readFileSync(path).toString('utf-8'));
}

(async function bumpVersion() {
  const write = process.argv.slice(2)[0] === 'write';
  const tldPackageJson = getPackageJson('./package.json');

  const latestVersion = execSync('npm view @http4t/core | grep latest | cut -d " " -f2').toString('utf-8').trim();

  tldPackageJson.version = latestVersion;

  if (write) {
    fs.writeFileSync('./package.json', JSON.stringify(tldPackageJson, undefined, 2))
  }

})();