import { execa } from 'execa'
import { root } from './root.js'

const main = async () => {
  await import('./build-watch.js')

  execa(
    'node',
    [
      'packages/server/node_modules/@lvce-editor/server/bin/server.js',
      '--test-path=packages/e2e',
      '--only-extension=packages/extension',
    ],
    {
      cwd: root,
      stdio: 'inherit',
    },
  )
}

main()
