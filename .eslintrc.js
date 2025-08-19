module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: [
    '@nuxtjs/eslint-config-typescript'
  ],
  rules: {
    // Allow type imports
    '@typescript-eslint/consistent-type-imports': 'off'
  }
}