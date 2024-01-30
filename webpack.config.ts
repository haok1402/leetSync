import path from "path";
import webpack from "webpack";
import CopyPlugin from "copy-webpack-plugin";
import { DefinePlugin } from "webpack";

const config: webpack.Configuration = {
  mode: "production",
  entry: {
    foreground: path.resolve(__dirname, "src/foreground.ts"),
    background: path.resolve(__dirname, "src/background.ts"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      "process.env": {
        CLIENT_ID: JSON.stringify(process.env.CLIENT_ID),
        CLIENT_SECRET: JSON.stringify(process.env.CLIENT_SECRET),
      },
    }),
    new CopyPlugin({
      patterns: [
        { from: "public/manifest.json", to: "manifest.json" },
        { from: "src/languagesConfig.ts", to: "languagesConfig.ts" }
      ],
    }),
  ],
};

export default config;
