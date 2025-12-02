module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@hooks': './src/hooks',
          '@api': './src/api',
          '@utils': './src/utils',
          '@assets': './src/assets',
          '@contexts': './src/contexts',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};