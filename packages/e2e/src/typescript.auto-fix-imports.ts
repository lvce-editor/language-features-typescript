import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.auto-fix-import'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/auto-fix-imports')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 11)

  // act
  await Editor.openSourceActions()

  // assert
  const organizeImportsAction = Locator('.SourceActionItem', { hasText: 'Organize Imports' })
  await expect(organizeImportsAction).toBeVisible()
  await Command.execute('EditorSourceAction.selectItem', 'Organize Imports')

  // assert
  await Editor.shouldHaveText(`import { add } from './math.ts'

add(1, 2)
`)
}
