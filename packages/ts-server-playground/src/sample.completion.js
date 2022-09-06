import { fork } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout } from 'node:timers/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = join(__dirname, '..', '..', '..')
const fixtures = join(root, 'packages', 'ts-server-playground', 'fixtures')
const workspace1 = join(fixtures, 'workspace-1')

const tsserverPath = join(
  root,
  'node_modules',
  'typescript',
  'lib',
  'tsserver.js'
)

const createChild = () => {
  const child = fork(
    tsserverPath,
    [
      '--useInferredProjectPerProjectRoot',
      '--disableAutomaticTypingAcquisition',
      '--locale',
      'en',
      '--noGetErrOnBackgroundUpdate',
      '--suppressDiagnosticEvents',
      '--useNodeIpc',
    ],
    {
      stdio: 'inherit',
    }
  )
  const send = (message) => {
    child.send(message)
  }
  child.on('message', (x) => {
    console.log({ x })
  })
  return {
    send,
  }
}

const id = (() => {
  let _id = 0
  return () => {
    return ++_id
  }
})()

const main = async () => {
  const child = createChild()
  child.send({
    type: 'request',
    command: 'configure',
    arguments: [
      {
        hostInfo: 'test',
      },
    ],
  })
  child.send({
    type: 'request',
    command: 'updateOpen',
    arguments: [
      {
        openFiles: [
          {
            file: join(workspace1, 'src', 'index.js'),
          },
        ],
      },
    ],
    seq: id(),
  })
  await setTimeout(1000)
  child.send({
    type: 'request',
    command: 'completionInfo',
    arguments: [
      {
        file: join(workspace1, 'src', 'index.js'),
        line: 1,
        offset: 1,
      },
    ],
    seq: id(),
  })
}

main()
