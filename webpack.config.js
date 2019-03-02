const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const AutoPrefixer = require('autoprefixer');

module.exports = {
  entry: {
    einsamkeit: ['./client/scripts/main.ts', './client/styles/main.scss'],
    admin: ['./client/scripts/admin.ts', './client/styles/admin.scss'],
  },

  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'scripts/[name].js',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
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
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          name: 'vendor',
          chunks: 'initial',
          enforce: true,
        },
      },
    },
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css',
    }),
    new CopyWebpackPlugin([
      {
        from: './client/images',
        to: './images',
      },
    ]),
  ],
};
