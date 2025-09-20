import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.references-error'

export const skip = 1

export const test: Test = async ({ Workspace, Main, Editor, Locator, expect }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/references-error').toString()
  const workspaceUrl = Workspace.resolveFileUrl(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(2, 2)

  // act
  await Editor.findAllReferences()

  // assert
  const viewletError = Locator('.Viewlet.Error')
  await expect(viewletError).toBeVisible()
  await expect(viewletError).toHaveText('Error: File not found /workspace/not-found.ts')
}
