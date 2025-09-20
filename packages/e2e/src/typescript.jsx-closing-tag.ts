import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.jsx-closing-tag'

export const skip = true

export const test: Test = async ({ Workspace, Editor }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/jsx-closing-tag').toString()
  const workspaceUrl = Workspace.resolveFileUrl(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Editor.setCursor(1, 13)

  // act
  // @ts-ignore
  await Editor.typeWithAutoClosingTag('>')

  // assert
  // TODO
  // await expect(rowTwo).toHaveText('return <div></div>')
}
