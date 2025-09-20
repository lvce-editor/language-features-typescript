import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.brace-completion'

export const skip = true

export const test: Test = async ({ Workspace, Main, Editor }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/auto-fix-spelling').toString()
  const workspaceUrl = Workspace.resolveFileUrl(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/test.ts`)
  await Editor.setCursor(0, 0)
  // TODO
}
