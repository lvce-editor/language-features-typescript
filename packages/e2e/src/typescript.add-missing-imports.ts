import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.add-missing-imports'

export const skip = 1

export const test: Test = async ({ FileSystem, Workspace, Main, Editor }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/add-missing-imports')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/c.ts`)
  await Editor.setCursor(0, 17)

  // act
  // TODO
  // 1. open source actions
  // 2. select add all missing imports
  // 3. verify the import has been added
  await Editor.addAllMissingImports()

  // assert
  // const text = await Editor.getText()
}
