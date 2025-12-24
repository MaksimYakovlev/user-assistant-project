const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { ModuleFederationPlugin } = require("webpack").container

const deps = require("./package.json").dependencies

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production"

  return {
    entry: "./src/index.js",
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "eval-source-map",

    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].[contenthash].js",
      clean: true,
      publicPath: "auto",
    },

    resolve: {
      extensions: [".js", ".jsx", ".json"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
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
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/i,
          type: "asset/resource",
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: "./index.html",
        inject: "body",
      }),

      // Module Federation Plugin
      new ModuleFederationPlugin({
        name: "pomoshchnik",
        filename: "remoteEntry.js",

        // Экспортируемые модули для использования в других приложениях
        exposes: {
          "./HelpWidget": "./src/components/HelpWidget.jsx",
          "./ChatDialog": "./src/components/ChatDialog.jsx",
          "./App": "./src/App.jsx",
        },

        // Общие зависимости между микрофронтендами
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
          "lucide-react": {
            singleton: false,
            requiredVersion: deps["lucide-react"],
          },
        },
      }),
    ],

    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true,
      proxy: [
        {
          context: ["/api"],
          target: "http://localhost:3001",
          changeOrigin: true,
        },
      ],
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      },
    },

    optimization: {
      moduleIds: "deterministic",
      runtimeChunk: "single",
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: -10,
            chunks: "all",
          },
        },
      },
    },
  }
}
