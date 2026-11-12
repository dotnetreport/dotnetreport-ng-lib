// Used by azure-pipelines-npm.yml after "ng build dotnetreport-lib". Checks dist/dotnetreport-ng and decides
// how to publish it.
//   node scripts/check-release.js
// Sets the pipeline variables npmPublish (true/false) and npmTag (latest or beta).
// Exits with an error if the package is incomplete or would move "latest" to an older version.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = 'dist/dotnetreport-ng';
const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
const fail = message => { console.error('##vso[task.logissue type=error]' + message); process.exit(1); };
const setVar = (name, value) => console.log(`##vso[task.setvariable variable=${name}]${value}`);

if (pkg.name !== 'dotnetreport-ng') fail(`Package name is "${pkg.name}", expected "dotnetreport-ng".`);
const match = /^(\d+)\.(\d+)\.(\d+)(-[0-9A-Za-z.-]+)?$/.exec(pkg.version || '');
if (!match) fail(`"${pkg.version}" is not a valid version.`);

const packed = JSON.parse(execSync('npm pack --dry-run --json', { cwd: dir }).toString())[0].files.map(f => f.path);
const expected = ['package.json', 'README.md', 'fesm2022/dotnetreport-ng.mjs', 'types/dotnetreport-ng.d.ts'];
const missing = expected.filter(f => !packed.includes(f));
if (missing.length) fail('Missing from the package: ' + missing.join(', '));
const stray = packed.filter(f => f.endsWith('.tgz'));
if (stray.length) fail('The package contains packed files: ' + stray.join(', ') + '. Delete them from dist/dotnetreport-ng.');
console.log(`dotnetreport-ng ${pkg.version}, ${packed.length} files:\n  ` + packed.join('\n  '));

const npmView = args => {
  try { return execSync(`npm view ${args} --json`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch (e) { return ''; }
};

if (npmView(`dotnetreport-ng@${pkg.version} version`)) {
  console.log(`dotnetreport-ng ${pkg.version} is already on npm. Nothing to publish.`);
  setVar('npmPublish', 'false');
  process.exit(0);
}

const prerelease = !!match[4];
if (!prerelease) {
  const latest = JSON.parse(npmView('dotnetreport-ng dist-tags') || '{}').latest;
  const parts = v => v.split('-')[0].split('.').map(Number);
  const newer = (a, b) => { for (let i = 0; i < 3; i++) { if (a[i] !== b[i]) return a[i] > b[i]; } return false; };
  if (latest && !newer(parts(pkg.version), parts(latest))) {
    fail(`${pkg.version} is not newer than the current latest release ${latest}. Bump "version" in projects/dotnetreport-lib/package.json.`);
  }
}

const tag = prerelease ? 'beta' : 'latest';
console.log(`Will publish dotnetreport-ng ${pkg.version} with the "${tag}" tag.`);
setVar('npmPublish', 'true');
setVar('npmTag', tag);
