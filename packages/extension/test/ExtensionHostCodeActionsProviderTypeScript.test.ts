import { expect, test } from '@jest/globals'
import { provideCodeActions } from '../src/parts/ExtensionHost/ExtensionHostCodeActionsProviderTypeScript.ts'

test('code actions can cross the isolated worker boundary', async () => {
  const actions = await provideCodeActions()
  const action = actions[0]

  expect(typeof action.execute).toBe('function')
  expect(structuredClone(action)).toEqual({
    kind: 'source.organizeImports',
    name: 'Organize Imports',
  })
})
