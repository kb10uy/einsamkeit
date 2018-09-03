import * as path from 'path';
import * as Pug from 'pug';

export default class PugCache {
  private options: Pug.Options;
  private templateDirectory: string;
  private globals: any;
  private renderFunctions: { [x: string]: Pug.compileTemplate };

  public constructor(options: Pug.Options, globals: any = {}) {
    this.options = options;
    this.templateDirectory = options.basedir || '';
    this.renderFunctions = {};
    this.globals = globals;
  }

  public render(filename: string, binding: Pug.LocalsObject) {
    this.makeSureRenderFunction(filename);
    return this.renderFunctions[filename]({
      ...binding,
      ...this.globals,
    });
  }

  public getFunction(filename: string, binding: Pug.LocalsObject) {
    this.makeSureRenderFunction(filename);
    return this.renderFunctions[filename];
  }

  private makeSureRenderFunction(filename: string) {
    if (!this.renderFunctions[filename]) {
      const renderFunction = Pug.compileFile(path.resolve(this.templateDirectory, filename), this.options);
      this.renderFunctions[filename] = renderFunction;
    }
  }
}
