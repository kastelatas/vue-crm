module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended'
  ],
  // add your custom rules here
  rules: {
    'semi': 0,
    'eqeqeq': 'off',
    'no-console' : 'off',
    'object-curly-spacing' : 'off',
    'no-useless-constructor' : 'off',
    'space-before-function-paren': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/require-default-prop' : 'off',
    'vue/valid-v-for': 'off',
    'vue/require-v-for-key': 'off',
    'vue/html-closing-bracket-spacing': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/no-side-effects-in-computed-properties' : 'off',
    'vue/html-closing-bracket-newline' : 'off',
    'vue/html-self-closing': ['error', {
      'html': {
        'void': 'always',
        'normal': 'never',
        'component': 'any'
      }
    }],
    'indent': 'off',
  }
};
