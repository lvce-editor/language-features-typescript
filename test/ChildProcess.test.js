import assert from 'node:assert'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { jest } from '@jest/globals'
import waitForExpect from 'wait-for-expect'
import * as ChildProcess from '../src/parts/ChildProcess/ChildProcess.js'

const getTmpDir = () => {
  return mkdtemp(join(tmpdir(), 'foo-'))
}

const createFile = async (content) => {
  const tmpDir = await getTmpDir()
  await writeFile(
    join(tmpDir, 'package.json'),
    JSON.stringify({
      type: 'module',
      main: 'main.js',
    })
  )
  await writeFile(join(tmpDir, 'main.js'), content)
  return join(tmpDir, 'main.js')
}

test('create', async () => {
  const testFilePath = await createFile('const x = 1')
  const child = ChildProcess.create([testFilePath])
  const exitCallback = jest.fn()
  child.on('exit', exitCallback)
  await waitForExpect(() => {
    expect(exitCallback).toHaveBeenCalledWith(0, null)
  })
})

test('exit code', async () => {
  const testFilePath = await createFile('process.exit(234)')
  const child = ChildProcess.create([testFilePath])
  const exitCallback = jest.fn()
  child.on('exit', exitCallback)
  await waitForExpect(() => {
    expect(exitCallback).toHaveBeenCalledWith(234, null)
  })
})

test('stdout', async () => {
  const testFilePath = await createFile(
    'setInterval(() => process.stdout.write("test"), 3)'
  )
  const child = ChildProcess.create([testFilePath], { stdio: 'overlapped' })
  const dataCallback = jest.fn()
  assert(child.stdout)
  child.stdout.on('data', dataCallback)
  await waitForExpect(() => {
    expect(dataCallback).toHaveBeenCalledWith(Buffer.from('test'))
  })
  child.kill()
})
