module.exports = {
  env: {
    browser: true,
  },
  extends: ['airbnb', 'plugin:prettier/recommended'],
  parser: 'babel-eslint',
  rules: {
    'no-console': 0,
    'no-plusplus': 'off',
    'react/jsx-one-expression-per-line': 'literal',
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'sort-keys': 1,
    'sort-vars': 1,
    'linebreak-style': 0,
    // 'react/prop-types': 0,
  },
};
