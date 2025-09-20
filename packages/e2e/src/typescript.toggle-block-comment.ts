import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.toggle-block-comment'

export const test: Test = async ({ Workspace, Main, Editor }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/toggle-block-comment').toString()
  const workspaceUrl = Workspace.resolveFileUrl(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)

  // Select the function body to test block comment toggling
  await Editor.setSelections([1, 0, 3, 0])

  // act
  await Editor.toggleBlockComment()

  // assert
  // const editorContent = await Editor.getText()
  // expect(editorContent).toContain('/*')
  // expect(editorContent).toContain('*/')

  // // Test toggling back (uncomment)
  // await Editor.toggleBlockComment()
  // const editorContentAfterToggle = await Editor.getText()
  // expect(editorContentAfterToggle).not.toContain('/*')
  // expect(editorContentAfterToggle).not.toContain('*/')
}
