const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/client/index.js',

  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ["es2015", "react", "stage-0"]
        }
      },
      {
        test: /\.cjs$/,
        loader: 'babel',
        query: {
          presets: ["es2015"]
        }
      }
    ]
  },
  
  resolve: {
    extensions: ['', '.js', '.jsx', '.cjs'],
    alias: {
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'redux': path.resolve('./node_modules/redux')
    }
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
      }
    }),
    new webpack.ProvidePlugin({
      process: 'process',
      Buffer: ['buffer', 'Buffer']
    })
  ]
};