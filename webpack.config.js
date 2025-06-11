const path = require('path');

module.exports = {
  entry: './src/clock-24hour-card.ts',
  output: {
    filename: 'clock-24hour-card.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};