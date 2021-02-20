const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");


module.exports = function (webpackEnv) {
    const isEnvProduction = webpackEnv === 'production';

    return {
      devtool: isEnvProduction ? 'source-map' : 'cheap-module-source-map',
      entry: "./src/index.js",
      output: {
          path: path.join(__dirname, "/dist"),
          filename: "index_bundle.[contenthash:8].js"
      },
      module: {
          rules: [{
              test: /\.m?js$/,
              exclude: /node_modules/,
              use: {
                  loader: 'babel-loader',
                  options: {
                      presets: ['@babel/preset-react']
                  }
              }
          }, {
              test: /\.css$/i,
              use: ["style-loader", "css-loader"],
          },
          {
              test: /\.(png|jpe?g|gif)$/i,
              use: [
                  {
                      loader: 'file-loader'
                  }
              ]
          }
          ]
      },
      plugins: [
          new HtmlWebPackPlugin({
              hash: true,
              filename: "index.html",  //target html
              template: "./src/index.html" //source html
          }),
      ]
    }
}
