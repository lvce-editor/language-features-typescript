import * as TsServerRequests from 'ts-server'
import { join } from 'node:path'

const DEFAULT_TSCONFIG = `{
  "moduleResolution": "node",
  "newLine": "lf",
  "skipLibCheck": true,
  "skipDefaultLibCheck": true,
  "rootDir": "."
}
`

const main = async () => {
  const server = {
    invoke() {
      return {
        success: true,
      }
    },
  }
  const fixture = join
  await TsServerRequests.configure(server, {})
  await TsServerRequests.braceCompletion(server, {
    file: join(tmpDir, 'index.ts'),
    line: 1,
    offset: 2,
    openingBrace: '{',
  })
}

main()
