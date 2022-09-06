import { fork, spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = join(__dirname, '..', '..', '..')

const tsserverPath = join(
  root,
  'node_modules',
  'typescript',
  'lib',
  'tsserver.js'
)

const main = () => {
  const child = fork(tsserverPath, {
    stdio: 'inherit',
  })
}

main()
