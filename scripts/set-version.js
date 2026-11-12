// Sets the dotnetreport-ng version, and its dotnetreport peer dependency, to the version in dotnetreport.nuspec,
// so the Angular library is released at the same version as the other Dotnet Report packages.
//   node scripts/set-version.js [path to dotnetreport.nuspec]     (default: ../dotnetreport.nuspec)
const fs = require('fs');
const path = require('path');

const nuspec = path.resolve(process.argv[2] || path.join(__dirname, '../../dotnetreport.nuspec'));
const match = /<version>\s*([^<\s]+)\s*<\/version>/.exec(fs.readFileSync(nuspec, 'utf8'));
if (!match) { console.error('No <version> found in ' + nuspec); process.exit(1); }
const version = match[1];

const file = path.join(__dirname, '../projects/dotnetreport-lib/package.json');
const pkg = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
pkg.version = version;
pkg.peerDependencies.dotnetreport = '^' + version;
fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');

// The workspace installs the same dotnetreport version, so the build and the demo app use matching scripts
const workspaceFile = path.join(__dirname, '../package.json');
const workspace = JSON.parse(fs.readFileSync(workspaceFile, 'utf8').replace(/^﻿/, ''));
workspace.dependencies.dotnetreport = '^' + version;
fs.writeFileSync(workspaceFile, JSON.stringify(workspace, null, 2) + '\n');
console.log('dotnetreport-ng ' + version);
