import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.toggle-block-comment-jsx'

export const skip = 1

export const test: Test = async ({ FileSystem, Workspace, Main, Editor }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/toggle-block-comment-jsx')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.tsx`)
  await Editor.setSelections([3, 15, 3, 15])

  // act
  await Editor.toggleBlockComment()

  // assert
  await Editor.shouldHaveText(`export function Component() {
  return (
    <div>
      {/* <div>test</div> */}
    </div>
  )
}

`)
}
