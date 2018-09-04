import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

import * as config from 'config';
import * as Pug from 'pug';
import { createLogger } from '@lib/utility';

const logger = createLogger('WebInterfaceRenderer');

/**
 * WebUI のテンプレート描画などをする
 */
export default class WebInterfaceRenderer {
  private manifestPath: string;
  private templateRoot: string;
  private isDevelopment: boolean;
  private pugOptions: Pug.Options;
  private clientConfig: any;

  private manifestWatcher?: fs.FSWatcher;
  private manifestScriptPath: string = '';
  private manifestStylePath: string = '';

  private renderers: Map<string, Pug.compileTemplate>;

  /**
   * @param manifest manifest.json のパス
   * @param template テンプレートが格納されている親ディレクトリ
   * @param devMode 開発モード (manifest.json の監視と Pug の毎回コンパイルが有効になる)
   */
  public constructor(manifest: string, template: string, devMode: boolean = true) {
    this.manifestPath = manifest;
    this.templateRoot = template;
    this.isDevelopment = devMode;
    this.pugOptions = {
      basedir: this.templateRoot,
    };
    this.clientConfig = config.get('client');
    this.renderers = new Map();
  }

  /**
   * 1度だけ必ず呼ぶ
   */
  public async initialize() {
    await this.onManifestChanged();
    if (this.isDevelopment) {
      this.manifestWatcher = fs.watch(this.manifestPath, () => this.onManifestChanged());
    }
  }

  /**
   * やめる
   */
  public terminate() {
    if (this.manifestWatcher) {
      this.manifestWatcher.close();
    }
  }

  /**
   * 描画する
   * @param template テンプレートファイル名
   * @param locals ローカル
   */
  public render<TLocal>(template: string, locals: TLocal) {
    this.tryCreateRenderer(template);
    const renderer = this.renderers.get(template);
    if (!renderer) {
      return '';
    }

    return renderer({
      ...(locals as any),
      scriptBundlePath: this.manifestScriptPath,
      styleBundlePath: this.manifestStylePath,
      config: this.clientConfig,
    });
  }

  /**
   * 描画関数を作成する
   * @param template テンプレートファイル名
   */
  private tryCreateRenderer(template: string) {
    if (!this.isDevelopment && this.renderers.has(template)) {
      return;
    }
    const renderer = Pug.compileFile(path.resolve(this.templateRoot, template), this.pugOptions);
    this.renderers.set(template, renderer);

    logger.info(`template '${template}' was compiled`);
  }

  /**
   * manifest.json を読み込む
   */
  private async onManifestChanged() {
    try {
      const buffer = fs.readFileSync(this.manifestPath);
      const manifest = JSON.parse(buffer.toString());
      this.manifestScriptPath = manifest['script.js'];
      this.manifestStylePath = manifest['style.css'];
      logger.info('manifest.json was updated and reloaded');
    } catch (ex) {
      // logger.error('manifest.json was not found or invalid');
    }
  }
}
