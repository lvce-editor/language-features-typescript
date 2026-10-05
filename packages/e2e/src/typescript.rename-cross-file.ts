import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.rename-cross-file'

export const test: Test = async ({
  Command,
  Editor,
  EditorRename,
  expect,
  FileSystem,
  Locator,
  Main,
  Settings,
  Workspace,
}) => {
  const groups = Locator('.EditorGroup')
  const importerGroup = groups.nth(0)
  const exporterGroup = groups.nth(1)
  const diagnostics = Locator('.Diagnostic')

  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/rename-cross-file')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setUri(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })
  await Main.openUri(`${workspaceUrl}/src/aboutWorkerMain.ts`)
  await Command.execute('Main.splitRight')
  await expect(groups).toHaveCount(2)
  await Main.openUri(`${workspaceUrl}/src/parts/Main/Main.ts`)
  await Main.selectTab(0, 0)
  await Editor.setCursor(2, 6)

  // act
  await Editor.openRename()
  await EditorRename.handleInput('gain')
  await EditorRename.accept()

  // assert
  await Editor.shouldHaveText("import * as Main from './parts/Main/Main'\n\nMain.gain()\n")
  await expect(exporterGroup).toContainText('export const gain = () => 1')
  await expect(importerGroup).toContainText('Main.gain()')
  await Command.execute('Editor.waitForDiagnostics')
  await Editor.shouldHaveDiagnostics([])

  // Rename back while both buffers are still unsaved.
  await Editor.setCursor(2, 6)
  await Editor.openRename()
  await EditorRename.handleInput('main')
  await EditorRename.accept()
  await expect(importerGroup).toContainText('Main.main()')
  await expect(exporterGroup).toContainText('export const main = () => 1')
  await Command.execute('Editor.waitForDiagnostics')
  await Editor.shouldHaveDiagnostics([])

  // Persist a changed name so reopening checks the saved rename, too.
  await Editor.setCursor(2, 6)
  await Editor.openRename()
  await EditorRename.handleInput('gain')
  await EditorRename.accept()
  await expect(importerGroup).toContainText('Main.gain()')
  await expect(exporterGroup).toContainText('export const gain = () => 1')

  await Command.execute('Editor.save')
  await Main.selectTab(1, 1)
  await Command.execute('Editor.save')
  await Main.selectTab(0, 0)
  await Main.closeAllEditors()
  await Main.openUri(`${workspaceUrl}/src/aboutWorkerMain.ts`)
  await Editor.shouldHaveText("import * as Main from './parts/Main/Main'\n\nMain.gain()\n")
  await Command.execute('Editor.waitForDiagnostics')
  await Editor.shouldHaveDiagnostics([])

  // An actual disagreement must still produce a diagnostic.
  await Editor.setText("import * as Main from './parts/Main/Main'\n\nMain.main()\n")
  await Command.execute('Editor.waitForDiagnostics')
  await expect(diagnostics).toHaveCount(1)
}
