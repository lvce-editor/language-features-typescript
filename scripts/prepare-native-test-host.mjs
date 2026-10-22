import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { chmod, cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

// Match the application-owned distribution pinned by lvce-editor.
const digests = {
  'darwin-arm64': '902e2fe1cf0799198ef902c6b8c310a450fef629a6baba41d45641ef75c04ebd',
  'darwin-x64': 'eba158cb54050f723d5ff781438f33de5640054440bb4f2bd170cfe9bc2eb551',
  'linux-arm': '33a15a7badb207a38957373c410b970319baac8960109232ab64502497caea06',
  'linux-arm64': 'c83d931ac9dd7549cde6e71246aa9d6a9812843023df3e277fe3b5dcf41dd0ea',
  'linux-x64': '7ecad6f67377e831856367ab062ef394f21506a611405bf8ac0ff039348637d3',
  'win32-arm64': '0a73534e6ee50cdbb2a29ac48657ca0ad13cf0f424cf63808e4df7baeb87b8be',
  'win32-x64': '61fc4e141d2bc687db580e71bbfa63b9c209f0310645d82ca1b457eb3a24fd19',
}
const target = `${process.platform}-${process.arch}`
assert(digests[target], `Unsupported native test target ${target}`)
const host = fileURLToPath(new URL('../node_modules/@lvce-editor/shared-process/', import.meta.url))
const executable = process.platform === 'win32' ? 'tsc.exe' : 'tsc'
const temporary = await mkdtemp(join(tmpdir(), 'typescript-native-test-'))
try {
  const response = await fetch(
    `https://github.com/microsoft/typescript-go/releases/download/typescript/v7.0.2/typescript-${target}.tgz`,
  )
  assert(response.ok, `Native test archive download failed: ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  assert.equal(createHash('sha256').update(bytes).digest('hex'), digests[target])
  const archive = join(temporary, 'typescript.tgz')
  await writeFile(archive, bytes)
  await promisify(execFile)('tar', ['-xzf', archive, '-C', temporary])
  const destination = join(host, 'language-servers', 'typescript')
  await mkdir(dirname(destination), { recursive: true })
  await rm(destination, { recursive: true, force: true })
  await cp(join(temporary, 'package'), destination, { recursive: true })
  await chmod(join(destination, 'lib', executable), 0o755)
  assert((await readFile(join(destination, 'lib', 'lib.d.ts'))).length > 0)
  console.log(`Prepared application-owned native test artifact ${target} at ${destination}`)
} finally {
  await rm(temporary, { recursive: true, force: true })
}
