import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import tsConfig from './tsconfig.json'
import pkgJson from './package.json'

const dist = 'dist'
const name = 'TeleportPro'
const globals = {}

const baseConfig = {
  input: 'src/index.js',
  external: [
    ...Object.keys(pkgJson.peerDependencies), 
    //...Object.keys(pkgJson.dependencies)
  ],
  plugins: [
    esbuild({
      target: tsConfig.compilerOptions.target,
      minify: true,
    }),
  ],
}


export default [
  {
    input: baseConfig.input,
    output: {
      file: dist + '/index.d.ts',
    },
    plugins: [dts()],
  },
  {
    ...baseConfig,
    output: {
      file: dist + '/index.esm.js',
      format: 'esm',
    },
  },
  {
    ...baseConfig,
    output: {
      name,
      globals,
      file: dist + '/index.umd.js',
      format: 'umd',
      exports: 'named',
      compact: true,
    },
  },
  {
    ...baseConfig,
    output: {
      name,
      globals,
      file: dist + '/index.min.js',
      format: 'iife',
      exports: 'named',
      compact: true,
    },
  },
]
