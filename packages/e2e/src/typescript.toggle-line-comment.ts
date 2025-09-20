import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.toggle-line-comment'

export const test: Test = async ({ Workspace, Main, Editor }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/toggle-line-comment').toString()
  const workspaceUrl = Workspace.resolveFileUrl(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 3)

  // act
  await Editor.toggleLineComment()

  // assert
  // TODO
}
