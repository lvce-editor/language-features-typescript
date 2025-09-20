import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.add-missing-imports'

export const skip = true

export const test: Test = async ({ Workspace, Main, Editor }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/add-missing-imports').toString()
  const workspaceUrl = Workspace.resolveFileUrl(fixtureUrl)
  await Workspace.setPath(workspaceUrl)

  await Main.openUri(`${workspaceUrl}/src/c.ts`)

  // act
  await Editor.organizeImports()

  // assert
  // const text = await Editor.getText()
}
