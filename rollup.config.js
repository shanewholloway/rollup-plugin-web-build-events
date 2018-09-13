import pkg from './package.json'
import rpi_jsy from 'rollup-plugin-jsy-lite'

const plugins = [
  rpi_jsy(),
]

const sourcemap = true

const configs = []
export default configs

configs.push({
  input: 'code/index.jsy',
  output: [
    {file: pkg.module, format: 'es', sourcemap},
    {file: pkg.main, format: 'cjs', exports:'named', sourcemap}],
  plugins })


add_node_jsy('sse')

add_node_jsy('server/sse')
add_node_jsy('server/dataLive')

add_web_jsy('browser/sse', {name: 'sse_build_events'})
add_web_jsy('browser/dataLive', {name: 'reloadDataLive'})
add_web_jsy('browser/reactErrorOverlay', {name: 'reloadReactErrorOverlay'})
add_web_jsy('browser/wholePage', {name: 'reloadWholePage'})


function add_node_jsy(fn_name, {external}={}) {
  configs.push({
    input: `code/${fn_name}.jsy`,
    output: [
      {file: `esm/${fn_name}.js`, format: 'es', sourcemap},
      {file: `cjs/${fn_name}.js`, format: 'cjs', exports:'named', sourcemap}],
    plugins, external }) }

function add_web_jsy(fn_name, {name, external}={}) {
  configs.push({
    input: `code/${fn_name}.jsy`,
    output: [
      {file: `esm/${fn_name}.js`, format: 'es', sourcemap},
      {file: `umd/${fn_name}.js`, format: 'umd', name, exports:'named', sourcemap}],
    plugins, external }) }
