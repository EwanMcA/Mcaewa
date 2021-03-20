const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");


module.exports = function (webpackEnv) {
  const isEnvProduction = webpackEnv === "production";

  return {
    devtool: isEnvProduction ? "source-map" : "cheap-module-source-map",
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
          loader: "babel-loader",
          options: { presets: ["@babel/preset-react"] }
        }
      }, {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: { localIdentName: "[name]__[local]___[hash:base64:5]" },
              sourceMap: false,
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      ]
    },
    plugins: [
      new HtmlWebPackPlugin({
        hash: true,
        filename: "index.html",  //target html
        template: "./src/index.html" //source html
      }),
    ],
    devServer: {
      historyApiFallback: true,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:8000",
          pathRewrite: { "^/api": "" },
        }
      },
    },
  };
};
