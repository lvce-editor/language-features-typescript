import { fork } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = join(__dirname, '..', '..', '..')

const tsServerPath = join(
  root,
  'node_modules',
  'typescript',
  'lib',
  'tsserver.js'
)

/**
 *
 * @param {*} param0
 * @returns
 */
export const createChild = ({ tsServerArgs }) => {
  const child = fork(tsServerPath, [...tsServerArgs])
  return {
    onMessage(listener) {
      child.on('message', listener)
    },
    send(message) {
      child.send(message)
    },
    dispose() {
      child.kill()
    },
  }
}

/**
 *
 * @param {string} name
 */
export const getFixture = (name) => {
  const fixtures = join(root, 'packages', 'ts-server-e2e-tests', 'fixtures')
  const fixture = join(fixtures, name)
  return fixture
}
