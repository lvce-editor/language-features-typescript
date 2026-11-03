# TypeScript 7 in the web editor

The browser worker uses the official TypeScript WASM compiler and JavaScript API,
both pinned to `7.1.0-dev.20261030.1`. The compiler is unmodified. The packaged
extension includes `tsc.wasm`, its standard libraries, and the bundled API client.
It does not include a TS6 runtime or fallback. TS6 remains a development dependency
for the existing build tools and legacy unit tests.

## Supported scope

The web worker registers completion and diagnostic providers. It resolves project
configuration, imported files, and dependency declarations through LVCE's
filesystem. Current document contents take precedence over stored files. The
optional application-bundled native TS7 server remains available on native hosts.

Hover, navigation, rename, references, import actions, and the other previous
worker providers are outside this first migration. Their legacy source and tests
remain in the repository, but are not part of the shipped worker. Auto-import
completion is not a release requirement.

## Plain static hosting

No cross-origin isolation, backend language server, or service-worker workaround
is required. The compiler uses LVCE's existing OPFS synchronous RPC transport when
shared memory is unavailable. Raw text responses use the transport's text handle,
matching the reader.

Only the compiler worker requests the existing host's `unsafe-eval` capability,
which permits WebAssembly compilation. The current host rejects the narrower
`wasm-unsafe-eval` spelling. The extension's main worker keeps `script-src 'self'`.

## Validation

- `node --test scripts/test-ts7-wasm.mjs` runs the real compiler against imported
  sources, npm declarations, unsaved overrides, disk changes, configuration changes,
  syntax errors, Unicode ranges, and virtual filesystem URIs.
- `node packages/build/src/run-e2e.ts ts7-e2e --headless` runs editor completion and
  diagnostic scenarios. Other legacy feature suites remain separate.
- After `npm run build` and `npm run build:static`, run
  `node scripts/test-ts7-static.mjs` to serve the actual Pages artifact without
  isolation headers and exercise completion, dependency types, imported unsaved
  edits, and diagnostic updates in Chrome. The script saves results and a screenshot
  in `.tmp/ts7-results`. CI uploads those files and a Pages preview artifact.

For development iterations, `npm run build -- --skip-package` omits archive
compression. CI and release builds create the extension archive normally.

## Current tradeoffs

Each request gets a fresh immutable project snapshot. Filesystem results are cached
within that request and rechecked on the next one, so correctness does not depend
on filesystem watches. Incremental snapshot reuse is a later optimization.

Dirty overrides are retained when an older host's tab snapshot cannot establish
that they were saved. Known saved overrides can retire when their tabs close.

The initial browser target is Chrome. Firefox and WebKit are not release gates for
this migration. The upstream WASM API is experimental; upgrade its host and compiler
artifact together and rerun the same regressions.

## Initial measurement

A local Chrome 151 run of the actual static artifact on November 3, 2026 completed
the editor regression in 6.28 seconds with no failed HTTP requests and
`crossOriginIsolated === false`. Worker initialization took 691 ms; the first
diagnostic request took 1,421 ms. Subsequent diagnostic requests took 178–288 ms,
and completion requests took 165–391 ms. The worker's WASM linear memory reached
96,468,992 bytes. This is allocated WASM memory, not the page's JavaScript heap or
the browser's total memory.

These are small-fixture worker timings on the local machine, excluding editor
rendering and RPC from the per-operation measurements. They do not establish
performance on a large project or a speedup over TS6. CI saves measurements from
its own run separately.
