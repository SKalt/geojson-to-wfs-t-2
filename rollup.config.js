import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
const name = 'geojsonToWfst';
const base = {
  input: 'src/index.js',
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs(),
    eslint(),
    babel({
      exclude: 'node_modules/**'
    }),
    replace({
      ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    (process.env.NODE_ENV === 'production' && uglify())
  ]
};
let plugins = [...base.plugins];
plugins.splice(3, 1, babel({
  exclude: 'node_modules/**',
  presets: [
    ['env', {
      targets: {
        browser: ['last 2 versions']
      },
      modules: false
    }]
  ]
}));

export default [
  Object.assign({}, base, {
    output: ['es', 'cjs', 'umd'].map(
      (format) => ({
        format,
        name,
        file: `dist/es6.${format}.js`
      })
    )
  }),
  Object.assign({}, base, {
    plugins,
    output: ['es', 'cjs', 'umd'].map(
      (format) => ({
        format,
        name,
        file: `dist/es5.${format}.js`
      })
    )
  })
];
