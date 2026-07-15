import pluginTypeScript from '@babel/preset-typescript'
import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { rollup, type RollupOptions } from 'rollup'

const commonjsPlugin = commonjs as unknown as typeof import('@rollup/plugin-commonjs').default

export const bundleExtensionJs = async (input: string, output: string): Promise<void> => {
  const plugins: RollupOptions['plugins'] = [
    nodeResolve({
      browser: true,
      preferBuiltins: true,
    }),
    commonjsPlugin(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      presets: [pluginTypeScript],
    }),
  ]
  const bundle = await rollup({
    external: (id) => id === 'electron' || id.startsWith('node:'),
    input,
    plugins,
    preserveEntrySignatures: 'strict',
    treeshake: {
      propertyReadSideEffects: false,
    },
  })
  await bundle.write({
    file: output,
    format: 'es',
    freeze: false,
    generatedCode: {
      constBindings: true,
      objectShorthand: true,
    },
    hoistTransitiveImports: false,
    inlineDynamicImports: true,
    minifyInternalExports: false,
    sourcemap: false,
  })
  await bundle.close()
}
