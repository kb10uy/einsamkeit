import * as path from 'path';
import * as fs from 'fs';
import PugCache from '@lib/pug-cache';

const currentDirectory = process.cwd();
let clientManifest: any;
if (!fs.existsSync('./dist/manifest.json')) {
  throw new Error('Client manifest not found. Build the client codes.');
  process.exit(1);
} else {
  // tslint:disable-next-line:no-var-requires
  clientManifest = require(path.resolve(currentDirectory, 'dist/manifest.json'));
}

export const pugCache: PugCache = new PugCache(
  {
    basedir: path.resolve(currentDirectory, 'assets/views'),
  },
  {
    scriptBundlePath: clientManifest['script.js'],
    styleBundlePath: clientManifest['style.css'],
  },
);
