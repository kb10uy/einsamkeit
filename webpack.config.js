const webpack = require('webpack');
const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackManifestPlugin = require('webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const AutoPrefixer = require('autoprefixer');

const publicDirectory = path.resolve(__dirname, 'dist/public');

module.exports = {
  entry: {
    script: './assets/scripts/main.ts',
    style: './assets/styles/main.scss',
  },
  output: {
    path: publicDirectory,
    filename: '[hash].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [AutoPrefixer()],
            },
          },
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['./dist/public/*.js', './dist/public/*.css']),
    new MiniCssExtractPlugin({
      filename: '[hash].css',
    }),
    new CopyWebpackPlugin([
      {
        from: './assets/static',
        to: publicDirectory,
      },
    ]),
    new WebpackManifestPlugin({
      fileName: '../manifest.json',
      filter(options) {
        if (options.name === 'script.js') return true;
        if (options.name === 'style.css') return true;
        return false;
      },
    }),
  ],
};
