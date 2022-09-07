const tsServerContent = `
const Commands = {
  configure(){
    return undefined
  },
  updateOpen(){
    return undefined
  },
  completionInfo(){
    return {
      flags: 0,
      isGlobalCompletion: true,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
      entries: [
        {
          name: 'AbortController',
          kind: 'var',
          kindModifiers: 'declare',
          sortText: '15'
        }
      ]
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

test('typescript.completion', async () => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir({ scheme: 'file' })
  await Workspace.setPath(tmpDir)
  const tsServerPath = await FileSystem.createExecutable(tsServerContent)
  await Settings.update({
    'typescript.tsserverPath': tsServerPath,
  })
  await FileSystem.writeFile(`${tmpDir}/test.ts`, 'win')
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 3)

  // act
  await Editor.openCompletion()

  // assert
  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItems = completions.locator('.EditorCompletionItem')
  await expect(completionItems.nth(0)).toHaveText('AbortController')
})
