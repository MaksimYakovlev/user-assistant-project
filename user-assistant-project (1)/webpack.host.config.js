const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { ModuleFederationPlugin } = require("webpack").container

const deps = require("./package.json").dependencies

// Конфигурация для host-приложения, которое будет загружать удаленный виджет
module.exports = (env, argv) => {
  const isProduction = argv.mode === "production"

  return {
    entry: "./host-example/index.js",
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "eval-source-map",

    output: {
      path: path.resolve(__dirname, "dist-host"),
      filename: "[name].[contenthash].js",
      clean: true,
      publicPath: "auto",
    },

    resolve: {
      extensions: [".js", ".jsx", ".json"],
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", ["@babel/preset-react", { runtime: "automatic" }]],
            },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: "./host-example/index.html",
        inject: "body",
      }),

      new ModuleFederationPlugin({
        name: "hostApp",

        // Удаленные модули, которые будет загружать host
        remotes: {
          pomoshchnik: "pomoshchnik@http://localhost:3000/remoteEntry.js",
        },

        shared: {
          react: {
            singleton: true,
            requiredVersion: deps.react,
            eager: true,
          },
          "react-dom": {
            singleton: true,
            requiredVersion: deps["react-dom"],
            eager: true,
          },
        },
      }),
    ],

    devServer: {
      port: 3002,
      hot: true,
      historyApiFallback: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  }
}
