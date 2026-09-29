import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.add-missing-imports'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/add-missing-imports')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setUri(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/c.ts`)
  await Editor.setCursor(0, 17)

  // act
  await Editor.openSourceActions()
  const action = Locator('.SourceActionItem', { hasText: 'Add All Missing Imports' })
  await expect(action).toBeVisible()
  await Command.execute('EditorSourceAction.selectItem', 'Add All Missing Imports')

  // assert
  await Editor.shouldHaveText(`import { a } from "./a.js";

export const c = a + 1
`)
}
