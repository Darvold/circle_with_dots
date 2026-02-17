const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // Режим разработки
  mode: 'development',
  
  // Точка входа
  entry: './src/index.tsx',
  
  // Выходной файл
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true, // Очищает dist перед каждой сборкой
  },
  
  // Разрешения для импорта файлов
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  
  // Модули и правила обработки
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/, // Все .ts и .tsx файлы
        exclude: /node_modules/,
        use: 'ts-loader', // Обрабатываем через ts-loader
      },
      {
        test: /\.css$/, // CSS файлы
        use: ['style-loader', 'css-loader'], // Обрабатываем CSS
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i, // Изображения
        type: 'asset/resource',
      },
    ],
  },
  
  // Плагины
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // Шаблон HTML
      filename: 'index.html',
    }),
  ],
  
  // Dev Server
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true, // Для React Router
  },
};