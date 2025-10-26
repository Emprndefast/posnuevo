const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
  const fallback = {
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "assert": require.resolve("assert"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "url": require.resolve("url"),
    "zlib": require.resolve("browserify-zlib"),
    "path": require.resolve("path-browserify"),
    "fs": false,
    "process": path.resolve(__dirname, 'src/process.js'),
    "buffer": require.resolve("buffer")
  };

  config.resolve.fallback = fallback;
  
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: path.resolve(__dirname, 'src/process.js'),
      Buffer: ['buffer', 'Buffer']
    })
  ];

  config.ignoreWarnings = [
    /Failed to parse source map/,
    /Can't resolve 'firebase\/firestore'/,
    /Can't resolve 'firebase\/auth'/,
    /Can't resolve 'firebase\/storage'/
  ];

  // Ignore Firebase modules to prevent errors during load
  config.resolve.alias = {
    ...config.resolve.alias,
    'firebase/firestore': path.resolve(__dirname, 'src/firebase/config.js'),
    'firebase/auth': path.resolve(__dirname, 'src/firebase/config.js'),
    'firebase/storage': path.resolve(__dirname, 'src/firebase/config.js'),
    'firebase/app': path.resolve(__dirname, 'src/firebase/config.js')
  };
  
  return config;
}; 