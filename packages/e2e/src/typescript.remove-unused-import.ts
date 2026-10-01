import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.remove-unused-import'
export const skip = 1

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/remove-unused-import')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setUri(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 11)

  const actionName = "Remove import from 'three/examples/jsm/loaders/FontLoader.js'"
  await Editor.openSourceActions()

  const removeImportAction = Locator('.SourceActionItem', { hasText: actionName })
  await expect(removeImportAction).toBeVisible()
  await expect(removeImportAction).toHaveText(actionName)
  await Command.execute('EditorSourceAction.selectItem', actionName)

  await Editor.shouldHaveText(`import { add } from './math.ts'

add(1, 2)
`)
}
