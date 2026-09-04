import { spawn } from 'node:child_process'
import { copyFile, cp, mkdir, readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './root.ts'

const [manifestName, ...args] = process.argv.slice(2)
const e2ePath = join(root, 'packages', 'e2e')
const isSmartSelectionE2e = manifestName === 'smart-selection-e2e'
const runnerPath = join(
  e2ePath,
  'node_modules',
  '@lvce-editor',
  'test-with-playwright',
  'bin',
  'test-with-playwright.js',
)
const testPath = join(root, '.tmp', 'e2e-manifests', manifestName)
const testSourcePath = join(e2ePath, 'src')
const allTestNames = (await readdir(testSourcePath)).filter((name) => !name.startsWith('_'))
const testNames = isSmartSelectionE2e
  ? allTestNames.filter(
      (name) => name.startsWith('typescript.grow-selection') || name === 'typescript.shrink-selection.ts',
    )
  : allTestNames.filter((name) => name !== 'typescript.shrink-selection.ts')

await rm(testPath, { force: true, recursive: true })
await mkdir(join(testPath, 'src'), { recursive: true })
await cp(join(e2ePath, 'fixtures'), join(testPath, 'fixtures'), { recursive: true })
await Promise.all(testNames.map((name) => copyFile(join(testSourcePath, name), join(testPath, 'src', name))))

const serverPath = join(root, 'node_modules', '@lvce-editor', 'server-smart-selection', 'src', 'server.js')
const child = spawn(
  process.execPath,
  [
    runnerPath,
    '--only-extension=../extension',
    `--test-path=${testPath}`,
    ...(isSmartSelectionE2e ? [`--server-path=${serverPath}`] : []),
    ...args,
  ],
  { cwd: e2ePath, stdio: 'inherit' },
)

const exitCode = await new Promise<number>((resolve, reject) => {
  child.once('error', reject)
  child.once('exit', (code) => resolve(code ?? 1))
})

process.exitCode = exitCode
