const path = require('path');
const fs = require('fs');

const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const md5File = require('md5-file');

module.exports = (env) => {
  let config = {
    stats: 'errors-warnings',
    target: ['web', 'es5'],
    entry: {
      main: path.resolve(__dirname, 'src', 'index.ts'),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].min.js',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /.s?css$/,
          use: [
            'css-hot-loader',
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].min.css',
      }),
    ],
  };

  if (env.development) {
    // prevention to not reload the entire page with CSS change
    LiveReloadPlugin.prototype._afterEmit = function (compilation) {
      const fileHashes = {};
      this.fileHashes = this.fileHashes || {};

      compilation.getAssets().forEach((asset) => {
        fileHashes[asset.name] = md5File.sync(
          path.resolve(__dirname, 'dist', asset.name)
        );
      });

      const include = Object.keys(fileHashes).filter((file) => {
        if (this.options.ignore && file.match(this.options.ignore)) {
          return false;
        }

        return (
          !(file in this.fileHashes) ||
          this.fileHashes[file] !== fileHashes[file]
        );
      });

      if (this._isRunning() && include.length) {
        this.fileHashes = fileHashes;
        this.logger.info('Reloading ' + include.join(', '));

        setTimeout(() => {
          this.server.notifyClients(include);
        }, this.options.delay);
      }
    };

    config.mode = 'development';
    config.watch = true;
    config.plugins = [
      ...config.plugins,
      new LiveReloadPlugin({
        key: fs.readFileSync(path.resolve(__dirname, 'files', 'server.key')),
        cert: fs.readFileSync(path.resolve(__dirname, 'files', 'server.crt')),
        protocol: 'https',
        port: 3001,
        hostname: 'localhost',
        appendScriptTag: true,
      }),
    ];
  }

  if (env.production) {
    config.mode = 'production';
    config.optimization = {
      ...config.optimization,
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
        new CssMinimizerPlugin(),
      ],
    };
  }

  return config;
};
