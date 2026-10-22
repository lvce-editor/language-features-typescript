import { spawn } from 'node:child_process'
import { copyFile, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { root } from './root.ts'

const [manifestName, ...args] = process.argv.slice(2)
const e2ePath = join(root, 'packages', 'e2e')
const isSmartSelectionE2e = manifestName === 'smart-selection-e2e'
const isNativeE2e = manifestName === 'native-e2e'
const isThreeJsE2e = manifestName === 'threejs-e2e'
const requireFromE2e = createRequire(join(e2ePath, 'package.json'))
const runnerPath = requireFromE2e.resolve('@lvce-editor/test-with-playwright/bin/test-with-playwright.js')
const testPath = join(root, '.tmp', 'e2e-manifests', manifestName)
const testSourcePath = join(e2ePath, 'src')
const allTestNames = (await readdir(testSourcePath)).filter((name) => !name.startsWith('_'))
const testNames = isNativeE2e
  ? allTestNames.filter((name) => name === 'typescript.native-ts7.ts')
  : isThreeJsE2e
    ? allTestNames.filter((name) => name === 'typescript.threejs-warm-edits.ts')
    : isSmartSelectionE2e
      ? allTestNames.filter(
          (name) => name.startsWith('typescript.grow-selection') || name === 'typescript.shrink-selection.ts',
        )
      : allTestNames.filter(
          (name) =>
            name !== 'typescript.shrink-selection.ts' &&
            name !== 'typescript.threejs-warm-edits.ts' &&
            name !== 'typescript.native-ts7.ts',
        )

await rm(testPath, { force: true, recursive: true })
await mkdir(join(testPath, 'src'), { recursive: true })
await cp(join(e2ePath, 'fixtures'), join(testPath, 'fixtures'), { recursive: true })
await Promise.all(testNames.map((name) => copyFile(join(testSourcePath, name), join(testPath, 'src', name))))

if (isThreeJsE2e) {
  // Exercise the pinned real declaration graph without vendoring dependencies.
  const threeFixture = join(testPath, 'fixtures', 'threejs')
  await mkdir(threeFixture, { recursive: true })
  const threePackage = JSON.parse(await readFile(join(root, 'node_modules', '@types', 'three', 'package.json'), 'utf8'))
  for (const name of ['@types/three', ...Object.keys(threePackage.dependencies)]) {
    const destination = join(threeFixture, 'node_modules', name)
    await mkdir(join(destination, '..'), { recursive: true })
    await cp(join(root, 'node_modules', name), destination, { recursive: true })
  }
  await writeFile(
    join(threeFixture, 'tsconfig.json'),
    JSON.stringify({
      files: ['main.ts'],
      compilerOptions: { strict: true, skipLibCheck: true, types: [], module: 'esnext', moduleResolution: 'bundler' },
    }),
  )
  await writeFile(
    join(threeFixture, 'main.ts'),
    "import * as THREE from 'three';\nconst material = new THREE.MeshBasicMaterial({ color: 'dodgerblue', wireframe: true });\nmaterial.color.set('blue');\n",
  )
}

const serverPath = join(root, 'node_modules', '@lvce-editor', 'server-smart-selection', 'src', 'server.js')
const child = spawn(
  process.execPath,
  [runnerPath, `--test-path=${testPath}`, ...(isSmartSelectionE2e ? [`--server-path=${serverPath}`] : []), ...args],
  { cwd: e2ePath, stdio: 'inherit' },
)

const exitCode = await new Promise<number>((resolve, reject) => {
  child.once('error', reject)
  child.once('exit', (code) => resolve(code ?? 1))
})

process.exitCode = exitCode
