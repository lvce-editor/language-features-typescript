test('typescript.references', async () => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir({ scheme: 'file' })
  await Workspace.setPath(tmpDir)
  const tsServerPath = await FileSystem.createExecutable(`
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
`)
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
  await Editor.setCursor(0, 9)

  // act
  await Editor.findAllReferences()

  // assert
  const viewletLocations = Locator('.Viewlet[data-viewlet-id="Locations"]')
  await expect(viewletLocations).toBeVisible()
  const viewletReferencesMessage = Locator('.LocationsMessage')
  await expect(viewletReferencesMessage).toHaveText('3 results in 2 files')
  const referenceItems = viewletLocations.locator('.TreeItem')
  await expect(referenceItems).toHaveCount(5)
  await expect(referenceItems.nth(0)).toHaveText('index.ts')
  await expect(referenceItems.nth(1)).toHaveText(
    `import { add } from './add.js'`
  )
  await expect(referenceItems.nth(2)).toHaveText(`add(1, 2)`)
  await expect(referenceItems.nth(3)).toHaveText(`add.ts`)
  await expect(referenceItems.nth(4)).toHaveText(
    `export const add = (a, b) => {}`
  )
})
