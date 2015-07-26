var path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bootic_client.js'
  },
  module: {
    loaders: [
      {test: /\.js6$/, exclude: /node_modules/, loader: "babel-loader"}
    ]
  }
}
