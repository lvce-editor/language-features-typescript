import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import * as ts from 'typescript'
import { createFileSystem } from '../packages/typescript-worker/src/parts/CreateFileSystem/CreateFileSystem.ts'
import { createTypeScriptLanguageService } from '../packages/typescript-worker/src/parts/CreateTypeScriptLanguageService/CreateTypeScriptLanguageService.ts'

globalThis.XMLHttpRequest = class {
  open(method, url) {
    this.url = url
  }
  setRequestHeader() {}
  send() {
    this.responseText = readFileSync(
      fileURLToPath(this.url).replace('/packages/typescript-worker/node_modules/', '/node_modules/'),
      'utf8',
    )
  }
}

const sharedFiles = new Map()
const interfaceCount = 250
const dependencyCount = 12
for (let dependency = 0; dependency < dependencyCount; dependency++) {
  sharedFiles.set(
    `/workspace/node_modules/@scope/shared/types${dependency}.d.ts`,
    Array.from(
      { length: interfaceCount },
      (_, i) => `export interface Shared${dependency}_${i} { value${i}: string; optional${i}?: number; }`,
    ).join('\n'),
  )
}
sharedFiles.set(
  '/workspace/node_modules/@scope/shared/index.d.ts',
  Array.from({ length: dependencyCount }, (_, i) => `export type { Shared${i}_0 } from './types${i}';`).join('\n'),
)
const projects = ['a', 'b']
const files = new Map([
  ['/workspace/node_modules/@scope/shared/package.json', '{"types":"index.d.ts"}'],
  ...sharedFiles,
  ...projects.map((project) => [
    `/workspace/project-${project}/main.ts`,
    `import type { ${projects.map((_, i) => `Shared${i}_0`).join(', ')} } from '@scope/shared';\nexport const ${project}: ${projects.map((_, i) => `Shared${i}_0`).join(' & ')} = { ${projects.map((_, i) => `value0: 'p${project}-${i}'`).join(', ')} };`,
  ]),
])
const dirs = new Set([
  '/workspace',
  '/workspace/node_modules',
  '/workspace/node_modules/@scope',
  '/workspace/node_modules/@scope/shared',
  '/workspace/project-a',
  '/workspace/project-b',
])
const rpc = {
  invokeSync(method, path) {
    if (method === 'SyncApi.exists')
      return files.has(path) || dirs.has(path) || [...files.keys()].some((name) => name.startsWith(`${path}/`))
    if (method === 'SyncApi.readFileSync') {
      if (!files.has(path)) throw new Error(`Not found: ${path}`)
      return files.get(path)
    }
    if (method === 'SyncApi.readDirSync') {
      const prefix = `${path}/`
      return [
        ...new Set(
          [...files.keys(), ...dirs]
            .filter((name) => name.startsWith(prefix))
            .map((name) => name.slice(prefix.length).split('/')[0]),
        ),
      ]
    }
    throw new Error(`Unexpected RPC ${method}`)
  },
}
const settings = (project, target = ts.ScriptTarget.ES2020) => ({
  options: {
    target,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    types: [],
    strict: true,
    rootDir: `/workspace/${project}`,
  },
  fileNames: [`/workspace/${project}/main.ts`],
  errors: [],
})
const summarizeRegistry = (registry) => {
  const buckets = registry.getBuckets()
  let entries = 0
  let sharedEntries = 0
  for (const paths of buckets.values()) {
    for (const [path, entry] of paths) {
      const sourceFiles = entry instanceof Map ? [...entry.values()] : [entry]
      entries += sourceFiles.length
      if (String(path).includes('@scope/shared')) sharedEntries += sourceFiles.length
    }
  }
  return { buckets: buckets.size, entries, sharedEntries }
}
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
const run = (mode) => {
  globalThis.gc()
  const sharedRegistry = mode === 'shared' ? ts.createDocumentRegistry(true, '') : undefined
  const fs = createFileSystem()
  const registries = new Set()
  const services = ['project-a', 'project-b'].map((project) => {
    const registry = sharedRegistry ?? ts.createDocumentRegistry(true, '')
    registries.add(registry)
    return createTypeScriptLanguageService(ts, fs, rpc, settings(project), registry)
  })
  const sourceStart = performance.now()
  const programs = services.map((service) => service.getProgram())
  const sourceLatencyMs = performance.now() - sourceStart
  const diagnosticsMs = []
  for (let pass = 0; pass < 6; pass++) {
    const start = performance.now()
    for (const [index, service] of services.entries())
      service.getSemanticDiagnostics(`/workspace/project-${index === 0 ? 'a' : 'b'}/main.ts`)
    diagnosticsMs.push(performance.now() - start)
  }
  const byPath = new Map()
  const sourceCounts = []
  for (const program of programs) {
    sourceCounts.push(program.getSourceFiles().length)
    for (const source of program.getSourceFiles()) {
      const list = byPath.get(source.fileName) ?? []
      list.push(source)
      byPath.set(source.fileName, list)
    }
  }
  const duplicatedPaths = [...byPath]
    .filter(([, sources]) => sources.length > 1 && new Set(sources).size > 1)
    .map(([path]) => path)
  const registryBeforeDispose = [...registries].map(summarizeRegistry)
  globalThis.gc()
  const heapUsedBytes = process.memoryUsage().heapUsed
  const result = {
    mode,
    heapUsedBytes,
    sourceLatencyMs,
    coldSemanticDiagnosticsMs: diagnosticsMs[0],
    medianWarmSemanticDiagnosticsMs: median(diagnosticsMs.slice(2)),
    sourceCounts,
    duplicatedPathCount: duplicatedPaths.length,
    registryBeforeDispose: [...registries].map(summarizeRegistry),
  }
  for (const service of services) service.dispose()
  result.registryEntriesAfterDispose = [...registries].reduce(
    (total, item) => total + summarizeRegistry(item).entries,
    0,
  )
  return result
}

const results = []
for (const mode of ['independent', 'shared', 'independent', 'shared', 'independent', 'shared']) results.push(run(mode))
const summarize = (mode) => {
  const runs = results.filter((result) => result.mode === mode)
  return {
    mode,
    medianPostGcHeapBytes: median(runs.map(({ heapUsedBytes }) => heapUsedBytes)),
    medianProgramSetupMs: median(runs.map(({ sourceLatencyMs }) => sourceLatencyMs)),
    medianWarmSemanticDiagnosticsMs: median(
      runs.map(({ medianWarmSemanticDiagnosticsMs }) => medianWarmSemanticDiagnosticsMs),
    ),
    sourceCounts: runs.map(({ sourceCounts }) => sourceCounts),
    duplicatedPathCounts: runs.map(({ duplicatedPathCount }) => duplicatedPathCount),
    registryEntryCounts: runs.map(({ registryBeforeDispose }) =>
      registryBeforeDispose.reduce((sum, registry) => sum + registry.entries, 0),
    ),
    sharedDependencyRegistryEntryCounts: runs.map(({ registryBeforeDispose }) =>
      registryBeforeDispose.reduce((sum, registry) => sum + registry.sharedEntries, 0),
    ),
    registryEntriesAfterDispose: runs.map(({ registryEntriesAfterDispose }) => registryEntriesAfterDispose),
    postGcHeapSamples: runs.map(({ heapUsedBytes }) => heapUsedBytes),
    programSetupSamplesMs: runs.map(({ sourceLatencyMs }) => sourceLatencyMs),
    coldSemanticDiagnosticsSamplesMs: runs.map(({ coldSemanticDiagnosticsMs }) => coldSemanticDiagnosticsMs),
  }
}
const independent = summarize('independent')
const shared = summarize('shared')
assert.ok(shared.duplicatedPathCounts.every((count) => count < independent.duplicatedPathCounts[0]))
assert.ok(independent.registryEntriesAfterDispose.every((count) => count === 0))
assert.ok(shared.registryEntriesAfterDispose.every((count) => count === 0))
console.log(
  JSON.stringify(
    {
      typescript: ts.version,
      node: process.version,
      measurement: 'process.heapUsed after forced GC; not RSS',
      fixture: {
        projects: 2,
        sharedDeclarationFiles: dependencyCount + 1,
        declarationsPerDependency: interfaceCount,
        compilerOptions: 'same source-affecting options',
      },
      comparison: {
        independent,
        shared,
        heapSavedBytes: independent.medianPostGcHeapBytes - shared.medianPostGcHeapBytes,
        heapSavedPercent:
          ((independent.medianPostGcHeapBytes - shared.medianPostGcHeapBytes) / independent.medianPostGcHeapBytes) *
          100,
        programSetupSavedMs: independent.medianProgramSetupMs - shared.medianProgramSetupMs,
      },
    },
    null,
    2,
  ),
)
