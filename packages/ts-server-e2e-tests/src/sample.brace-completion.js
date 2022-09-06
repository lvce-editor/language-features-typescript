import * as TsServerRequests from 'ts-server/src/parts/TsServerRequests/TsServerRequests.js'
import { join } from 'node:path'

const createServer = () => {
  return {
    invoke() {
      return {
        success: true,
      }
    },
  }
}

const main = async () => {
  const server = createServer()
  console.log(TsServerRequests)
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
