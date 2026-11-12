const gulp = require('gulp');
const { series } = require('gulp');
const { exec } = require('child_process');
const path = require('path');

// Paths are relative to this file, so the workspace builds wherever it is cloned
const rootPath = __dirname;
const appPath = path.join(__dirname, 'projects/dotnetreport-app');
const libPath = path.join(__dirname, 'projects/dotnetreport-lib');
const packageJson = require('./projects/dotnetreport-lib/package.json');

// The demo app uses the dotnetreport scripts at the version the library asks for
const dotnetreportVersion = packageJson.peerDependencies.dotnetreport;

const buildLibCommand = 'ng build dotnetreport-lib';
const uninstallPackageCommand = 'npm uninstall dotnetreport-ng';
const installPackageCommand = 'npm install file:dist/dotnetreport-ng --no-save';
const uninstalldnrPackageCommand = 'npm uninstall dotnetreport';
const installdnrPackageCommand = `npm install dotnetreport@${dotnetreportVersion} --save-peer`;
const serveCommand = 'ng serve';

function buildLib(cb) {
  exec(buildLibCommand, { cwd: rootPath }, cb);
}

function uninstallDnrPackage(cb) {
  exec(uninstalldnrPackageCommand, { cwd: libPath }, cb);
}

function uninstallPackage(cb) {
  exec(uninstallPackageCommand, { cwd: rootPath }, cb);
}

function installDnrPackage(cb) {
  exec(installdnrPackageCommand, { cwd: libPath }, cb);
}

function installPackage(cb) {
  exec(installPackageCommand, { cwd: rootPath }, cb);
}

function serve(cb) {
  const child = exec(serveCommand, { cwd: appPath });
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  child.on('close', cb);
}

// Packs dist/dotnetreport-ng into a .tgz. ng-packagr already writes the package.json with the
// version and dependencies from projects/dotnetreport-lib/package.json.
function buildRelease(cb) {
  console.log(`Packing dotnetreport-ng ${packageJson.version}`);
  exec('npm pack', { cwd: path.join(rootPath, 'dist/dotnetreport-ng') }, cb);
}

exports.default = series(uninstallDnrPackage, installDnrPackage, buildLib, uninstallPackage, installPackage);
exports.serve = serve;
exports.buildDev = buildLib;
exports.buildRelease = series(buildLib, buildRelease);
