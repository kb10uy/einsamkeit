const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const AutoPrefixer = require('autoprefixer');

module.exports = {
  entry: ['./client/scripts/main.ts', './client/styles/main.scss'],
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'scripts/einsamkeit.js',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              url: false,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [AutoPrefixer()],
            },
          },
          {
            loader: 'sass-loader',
            options: {
              outputStyle: 'expanded',
            },
          },
        ],
      },
    ],
  },
  optimization: {
    splitChunks: {
      name: 'vendor',
      chunks: 'initial',
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles/einsamkeit.css',
    }),
    new CopyWebpackPlugin([]),
  ],
};
