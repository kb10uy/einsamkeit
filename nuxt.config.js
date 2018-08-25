const path = require('path');
const config = require('config');

const currentDirectory = process.cwd();

module.exports = {
  srcDir: path.resolve(currentDirectory, 'client'),

  // 出力するクライアントコード上の設定
  head: {
    htmlAttrs: {
      lang: config.get('client.lang'),
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: config.get('client.description') },
    ],
    link: [
      {
        rel: 'icon',
        href: '/favicon.ico',
        type: 'image/vnd.microsoft.icon',
      },
    ],
  },
};
