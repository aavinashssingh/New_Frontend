const CompressionPlugin = require("compression-webpack-plugin");
const BrotliPlugin = require("brotli-webpack-plugin");

module.exports = {
  plugins: [
    new CompressionPlugin({
      filename: "[path][base].gz", // Adjust the filename pattern if needed
      algorithm: "gzip",
      test: /\.(js|css|html|svg)$/, // Compress only specified file types
      threshold: 10240, // Only compress files larger than 10 KB
      minRatio: 0.8, // Only compress files if compression ratio is higher than 0.8
    }),
    new BrotliPlugin({
      asset: "[path].br[query]", // Adjust the asset filename pattern if needed
      test: /\.(js|css|html|svg)$/, // Compress only specified file types
      threshold: 10240, // Only compress files larger than 10 KB
      minRatio: 0.8, // Only compress files if compression ratio is higher than 0.8
    }),
  ],
};