var path = require('path'),
    webpack = require('webpack');

module.exports = {
  entry: './index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bootic_client.js'
  },
  module: {
    loaders: [
      {test: /\.js6$/, exclude: /node_modules/, loader: "babel-loader"}
    ]
  },
  plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
        },
        output: {
            comments: false,
        },
      }),
  ]
}
