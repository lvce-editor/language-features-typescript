import { fork } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = join(__dirname, '..', '..', '..')
const fixtures = join(root, 'packages', 'ts-server-playground', 'fixtures')
const workspace = join(fixtures, 'workspace-2')

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
      // '--suppressDiagnosticEvents',
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
    arguments: {
      openFiles: [
        {
          file: join(workspace, 'src', 'index.ts'),
          fileContent: `let x: string = 1
            `,
        },
      ],
    },
    seq: id(),
  })
  child.send({
    type: 'request',
    command: 'braceCompletion',
    arguments: {
      line: 1,
      offset: 2,
      openingBrace: '{',
    },
  })
  // child.send({
  //   type: 'request',
  //   command: 'completionInfo',
  //   arguments: [
  //     {
  //       file: join(workspace, 'src', 'index.js'),
  //       line: 1,
  //       offset: 1,
  //     },
  //   ],
  //   seq: id(),
  // })
}

main()
