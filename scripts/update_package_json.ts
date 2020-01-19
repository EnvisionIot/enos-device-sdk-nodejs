import * as fs from 'fs';
import * as path from 'path';

const packagesRoot = path.join(__dirname, '..', 'packages');

const packages = fs.readdirSync(packagesRoot).filter(
  item => (fs.lstatSync(path.join(packagesRoot, item)).isDirectory())
);

packages.forEach((packageName) => {
  const packageJSONPath = path.join(packagesRoot, packageName, 'package.json');
  // const tsconfigPath = path.join(packagesRoot, packageName, 'tsconfig.json');

  const packageJSONData = JSON.parse(fs.readFileSync(packageJSONPath).toString());
  delete packageJSONData.scripts;
  packageJSONData.main = 'index.js';
  packageJSONData.types = 'dist/index.d.ts';
  packageJSONData.files = ['dist', 'src'];
  packageJSONData.scripts = {
    clean: 'rm -rf ./dist && rm -rf tsconfig.package.tsbuildinfo',
    dev: 'tsc -b -w ./tsconfig.package.json',
    build: 'npm run clean && tsc -b -w ./tsconfig.package.json',
    prepublish: 'npm run build'
  };
  packageJSONData.publishConfig = {
    access: 'public'
  };
  fs.writeFileSync(packageJSONPath, JSON.stringify(packageJSONData, null, '  '));
});
