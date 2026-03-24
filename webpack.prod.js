const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  devtool: false,
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
    new WorkboxWebpackPlugin.GenerateSW({
      swDest: "sw.js",
      clientsClaim: true,
      skipWaiting: true,
      cleanupOutdatedCaches: true,
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      navigateFallback: "/index.html",
      additionalManifestEntries: [
        { url: "/manifest.json", revision: null },
        { url: "/favicon.ico", revision: null },
        { url: "/icons/apple-touch-icon.png", revision: null },
        { url: "/icons/icon-192x192.png", revision: null },
        { url: "/icons/icon-512x512.png", revision: null },
        { url: "/model/metadata.json", revision: null },
        { url: "/model/model.json", revision: null },
        { url: "/model/weights.bin", revision: null },
      ],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com/i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-cache",
            cacheableResponse: {
              statuses: [0, 200],
            },
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
        {
          urlPattern: /^https:\/\/unpkg\.com/i,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "cdn-assets-cache",
            cacheableResponse: {
              statuses: [0, 200],
            },
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 60 * 60 * 24 * 7,
            },
          },
        },
        {
          urlPattern: /^https:\/\/api\./i,
          handler: "NetworkFirst",
          options: {
            cacheName: "api-cache",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    }),
  ],
});
