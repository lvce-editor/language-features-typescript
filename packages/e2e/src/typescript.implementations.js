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

test.skip('typescript.implementations', async () => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir({ scheme: 'file' })
  await Workspace.setPath(tmpDir)
  const tsServerPath = await FileSystem.createExecutable(tsServerContent)
  await Settings.update({
    'typescript.tsserverPath': tsServerPath,
  })
  await FileSystem.writeFile(
    `${tmpDir}/add.js`,
    `export const add = () => {}
`
  )
  await FileSystem.writeFile(
    `${tmpDir}/test.js`,
    `import {add} from './add.js'

add(1,2)
`
  )
  await FileSystem.writeFile(`${tmpDir}/tsconfig.json`, `{}`)
  await Main.openUri(`${tmpDir}/test.js`)

  // act
  await Editor.openEditorContextMenu()
  await ContextMenu.selectItem('Find All Implementations')

  // assert
  const viewletLocations = Locator('.Viewlet[data-viewlet-id="Locations"]')
  await expect(viewletLocations).toBeVisible()
  const viewletImplementationsMessage = Locator('.LocationsMessage')
  await expect(viewletImplementationsMessage).toHaveText('1 result in 1 file')
  const referenceItems = viewletLocations.locator('.TreeItem')
  await expect(referenceItems).toHaveCount(2)
  const implementationItemOne = referenceItems.nth(0)
  await expect(implementationItemOne).toHaveText('add.js')
  const implementationItemTwo = referenceItems.nth(1)
  await expect(implementationItemTwo).toHaveText(`export const add = () => {}`)
})

export {}
