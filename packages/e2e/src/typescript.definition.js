const tsServerContent = `
const Commands = {
  configure(){
    return undefined
  },
  updateOpen(){
    return undefined
  },
  references(){
    return {
      refs: [
        {
          contextEnd: {
            line: 1,
            offset: 31,
          },
          contextStart: {
            line: 1,
            offset: 1,
          },
          end: {
            line: 1,
            offset: 13,
          },
          file: '/test/index.ts',
          isDefinition: true,
          isWriteAccess: true,
          lineText: "import { add } from './add.js'",
          start: {
            line: 1,
            offset: 10,
          },
        },
        {
          end: {
            line: 3,
            offset: 4,
          },
          file: '/test/index.ts',
          isDefinition: false,
          isWriteAccess: false,
          lineText: 'add(1, 2)',
          start: {
            line: 3,
            offset: 1,
          },
        },
        {
          contextEnd: {
            line: 1,
            offset: 32,
          },
          contextStart: {
            line: 1,
            offset: 1,
          },
          end: {
            line: 1,
            offset: 17,
          },
          file: '/test/add.ts',
          isDefinition: false,
          isWriteAccess: true,
          lineText: 'export const add = (a, b) => {}',
          start: {
            line: 1,
            offset: 14,
          },
        },
      ],
      symbolDisplayString: \`(alias) const add: (a: any, b: any) => void
  import add\`,
      symbolName: 'add',
      symbolStartOffset: 10,
    }
  }
}

const handleMessageRequest = (message) => {
  console.log(message)
  const fn = Commands[message.command]
  const result = fn(message.arguments)
  process.send({
    type: 'response',
    body: result,
    success: true,
    request_seq: message.seq
  })
}

const handleMessage = (message) => {
  switch(message.type){
    case 'request':
      return handleMessageRequest(message)
    case 'response':
      return handleMessageResponse(message)
    default:
      return

  }
}

process.on('message', handleMessage)
`

test.skip('typescript.definition', async () => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir({ scheme: 'file' })
  await Workspace.setPath(tmpDir)
  const tsServerPath = await FileSystem.createExecutable(tsServerContent)
  await Settings.update({
    'typescript.tsserverPath': tsServerPath,
  })
  await FileSystem.writeFile(`${tmpDir}/test.ts`, 'window')
  await Main.openUri(`${tmpDir}/test.ts`)

  // act
  await Editor.goToDefinition()

  // assert
  const mainTabs = Locator('.MainTab')
  await expect(mainTabs).toHaveCount(2)
  const mainTabTwo = mainTabs.nth(1)
  await expect(mainTabTwo).toHaveText('lib.dom.d.ts')

  const editor = Locator('.Editor')
  // await expect(editor).toContainText(
  //   `interface AddEventListenerOptions extends EventListenerOptions {`
  // )
})

export {}
