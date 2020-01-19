const restrictedGlobals = require('confusing-browser-globals');

module.exports = {
  extends: ['eslint-config-airbnb'],
  parser: 'babel-eslint',
  plugins: ['import', 'jsx-a11y', 'react'],
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      "experimentalObjectRestSpread": true
    }
  },
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: {
          "experimentalObjectRestSpread": true
        },
        // typescript-eslint specific options
        warnOnUnsupportedTypeScriptVersion: true
      },
      plugins: ['@typescript-eslint'],
      // If adding a typescript-eslint version of an existing ESLint rule,
      // make sure to disable the ESLint rule here.
      rules: {
        // TypeScript's `noFallthroughCasesInSwitch` option is more robust (#6906)
        'default-case': 'off',
        // "tsc" already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/291)
        'no-dupe-class-members': 'off',
        // "tsc" already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/477)
        'no-undef': 'off',

        // Add TypeScript specific rules (and turn off ESLint equivalents)
        '@typescript-eslint/consistent-type-assertions': 'warn',
        'no-array-constructor': 'off',
        '@typescript-eslint/no-array-constructor': 'warn',
        '@typescript-eslint/no-namespace': 'error',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': [
          'warn',
          {
            functions: false,
            classes: false,
            variables: false,
            typedefs: false
          }
        ],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            args: 'none',
            ignoreRestSiblings: true
          }
        ],
        'no-useless-constructor': 'off',
        'semi': ['error', 'always'],
        'no-extra-semi': 'off',
        '@typescript-eslint/no-useless-constructor': 'warn' // 这里需要注意，以前是error，统一好一点
      }
    }
  ],
  rules: {
    // common
    'no-undef': 'error', // Disallow Undeclared Variables
    'comma-dangle': ['error', 'never'], // require or disallow trailing commas
    'no-else-return': 'error', // Disallow return before else
    'no-trailing-spaces': 'error', // disallow trailing whitespace at the end of lines
    'keyword-spacing': 'error', // enforce consistent spacing before and after keywords
    'indent': ['error', 2], // enforce consistent indentation
    'max-len': ['error', 200], // enforce a maximum line length
    'no-script-url': 'off', // Disallow Script URLs
    'radix': ['error', 'as-needed'], // Require Radix Parameter
    'space-before-function-paren': ['warn', 'never'], // Require or disallow a space before function parenthesis
    'no-underscore-dangle': ['error', { 'allowAfterThis': true }], // disallow dangling underscores in identifiers
    'object-curly-spacing': ['error', 'never'], // enforce consistent spacing inside braces
    'no-useless-constructor': 'error', // Disallow unnecessary constructor
    'object-shorthand': ['error', 'always', { 'avoidQuotes': true }], // Require Object Literal Shorthand Syntax
    'arrow-body-style': ['error', 'as-needed'], // Require braces in arrow function body
    'no-param-reassign': ['error', { 'props': false }], // Disallow Reassignment of Function Parameters
    'no-console': 'off', // disallow the use of console
    'jsx-quotes': ['error', 'prefer-single'], // enforce the consistent use of either double or single quotes in JSX attributes
    'func-names': 'off', // Require or disallow named function expressions
    'prefer-destructuring': 'off', // Prefer destructuring from arrays and objects
    'consistent-return': 'off', // require return statements to either always or never specify values
    'function-paren-newline': 'off', // enforce consistent line breaks inside function parentheses
    'object-curly-newline': 'off', // enforce consistent line breaks inside braces
    'no-restricted-globals': ['error'].concat(restrictedGlobals), // Disallow specific global variables
    'no-plusplus': 'off', // disallow the unary operators ++ and --
    'no-use-before-define': 'off', // Disallow Early Use
    'semi': ['error', 'always'], // require or disallow semicolons instead of ASI
    'class-methods-use-this': 'off', // Enforce that class methods utilize this
    'global-require': 'off', // Enforce require() on the top-level module scope
    'strict': 'off', // require or disallow strict mode directives
    'lines-between-class-members': 'off',

    // import
    'import/no-unresolved': 'off', // Ensure imports point to a file/module that can be resolved
    'import/extensions': 'off', // Ensure consistent use of file extension within the import path
    'import/no-dynamic-require': 'off', // Forbid require() calls with expressions
    'import/prefer-default-export': 'off', // Prefer a default export if module exports a single name
    'react/destructuring-assignment': 'off', // Enforce consistent usage of destructuring assignment of props, state, and context
    'react/button-has-type': 'off' // Forbid "button" element without an explicit "type" attribute
  },
};
