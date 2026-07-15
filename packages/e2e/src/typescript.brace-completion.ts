import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.brace-completion'

export const test: Test = async ({ FileSystem, Workspace, Main, Editor }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/brace-completion')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 3)

  // act
  await Editor.invokeBraceCompletion('{')

  // assert
  await Editor.shouldHaveText('win{}\n')
}
