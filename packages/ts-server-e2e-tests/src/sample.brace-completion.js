import { join } from 'node:path'
import { TsServer, TsServerProcess } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'

import { dirname } from 'node:path'
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

console.log({ root })
const main = async () => {
  const child = TsServerProcess.create({
    tsServerPath,
  })
  const server = TsServer.create(child)
  console.log(server)
  const fixture = ``
  await TsServerRequests.configure(server, {})
  await TsServerRequests.braceCompletion(server, {
    file: join(fixture, 'src', 'index.ts'),
    line: 1,
    offset: 2,
    openingBrace: '{',
  })
}

main()
