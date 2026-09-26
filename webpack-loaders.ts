import MiniCSSExtractPlugin from "mini-css-extract-plugin"
import TerserPlugin from "terser-webpack-plugin"
import webpack from "webpack"

export const babelLoaderConfiguration: (b: boolean) => webpack.RuleSetRule = (
  isDev
) => ({
  test: [/\.tsx?$/, /\.ts$/, /\.js$/],
  use: {
    loader: "babel-loader",
    options: {
      cacheDirectory: true,
      presets: [
        ["@babel/preset-env", { targets: { chrome: "152" } }],
        "@babel/preset-typescript",
        [
          "@babel/preset-react",
          {
            runtime: "automatic",
            development: isDev,
            importSource: "@welldone-software/why-did-you-render",
          },
        ],
      ],
      plugins: [
        isDev && "react-refresh/babel",
        "@babel/plugin-transform-runtime",
        ["@babel/plugin-transform-typescript", { isTSX: true }],
        "@babel/plugin-transform-react-jsx",
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-transform-modules-commonjs",
      ].filter((s) => s),
    },
  },
})

export const nodeConfiguration: webpack.RuleSetRule = {
  test: /\.node$/,
  loader: "node-loader",
}

export const scssConfiguration: webpack.RuleSetRule = {
  test: /\.s?css$/,
  use: [
    {
      loader: MiniCSSExtractPlugin.loader,
    },
    {
      loader: "css-loader",
      options: {
        importLoaders: 1,
      },
    },
    {
      loader: "postcss-loader",
    },
    {
      loader: "sass-loader",
    },
  ],
}

export const imageLoaderConfiguration: webpack.RuleSetRule = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: "url-loader",
    options: {
      name: "[name].[ext]",
      esModule: false,
    },
  },
}

export const assetLoaderConfiguration: webpack.RuleSetRule = {
  test: /\.(ttf)$/,
  type: "asset/resource",
}

// terser decides whether a key can be written bare using the Unicode tables of
// the node that runs the build. Node 20 (Debian 13) treats "・" as ID_Continue
// (Unicode 15.1), but Electron 21 does not, so `{アニメ・特撮:...}` became a
// SyntaxError and the renderer never started. Keep keys quoted.
export const terserMinimizer = new TerserPlugin({
  terserOptions: { format: { quote_keys: true } },
})
