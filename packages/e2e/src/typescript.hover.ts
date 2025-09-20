import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.hover'

export const test: Test = async ({ Workspace, Main, Editor, Locator, expect }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/hover').toString()
  const workspaceUrl = Workspace.resolveFileUrl(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 4)

  // act
  await Editor.openHover()

  // assert
  const hover = Locator('.HoverDisplayString')
  await expect(hover).toHaveText('let x: number')
}
