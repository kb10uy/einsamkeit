import * as path from 'path';
import WebInterfaceRenderer from '@lib/web-interface-renderer';

const currentDirectory = process.cwd();

export const webRenderer = new WebInterfaceRenderer(
  path.resolve(currentDirectory, 'dist/manifest.json'),
  path.resolve(currentDirectory, 'assets/views'),
);

webRenderer.initialize();
