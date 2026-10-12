import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.organize-imports'

export const test: Test = async ({ Editor, FileSystem, Main, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/organize-imports')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/c.ts`)
  await Editor.setText(`import { b } from './b.ts'
import unusedPackageDefault from 'unused-package'
import { FontLoader } from 'unused-package/examples/jsm/loaders/FontLoader.js'
import { a } from './a.ts'
import './side-effect.ts'

export const c = a + 2
`)

  // act
  await Editor.organizeImports()

  // assert
  await Editor.shouldHaveText(`import { a } from './a.ts'
import './side-effect.ts'

export const c = a + 2
`)

  await Editor.organizeImports()
  await Editor.shouldHaveText(`import { a } from './a.ts'
import './side-effect.ts'

export const c = a + 2
`)
}
