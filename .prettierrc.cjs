// @ts-check
/// <reference types="@prettier/plugin-pug/src/prettier" />

/**
 * @type {import('prettier').Options}
 */
module.exports = {
  // `require.resolve` is needed for e.g. `pnpm`
  plugins: [
    require.resolve('@prettier/plugin-pug'),
    require.resolve('prettier-plugin-css-order'),
  ],
  singleQuote: true,
  semi: false,
  trailingComma: 'all',
  order: 'alphabetical',
  noImplicit: ['callParens'],
  emptyParamListParens: true,
}
