import { join, resolve } from 'path'
import * as Root from '../Root/Root.js'

export const getDefaultTsServerPath = () => {
  return process.env.TS_SERVER_PATH || resolve(join(Root.root, 'node_modules', 'typescript', 'lib', 'tsserver.js'))
}
