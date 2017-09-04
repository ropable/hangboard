var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './src/public/main.js',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'app.js'
  }
};
