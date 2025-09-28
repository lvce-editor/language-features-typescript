import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.organize-imports'

// export const skip = true

export const test: Test = async ({ FileSystem, Main, Editor, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/organize-imports')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/c.ts`)

  // act
  await Editor.organizeImports()

  // assert
  // TODO verify that imports are organized
  // const text = await Editor.getText()
}
