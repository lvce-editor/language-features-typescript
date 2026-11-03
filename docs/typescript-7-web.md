# TypeScript 7 in the web editor

The browser worker uses the official TypeScript WASM compiler and JavaScript API,
both pinned to `7.1.0-dev.20261030.1`. The compiler is unmodified. The packaged
extension includes `tsc.wasm`, its standard libraries, and the bundled API client.
It does not include a TS6 runtime or fallback. TS6 remains a development dependency
for the existing build tools and legacy unit tests.

## Supported scope

The web worker keeps completion, diagnostics, hover, document symbols, definitions,
type definitions, references, rename, implementations, signature help, selection
expansion, comments, brace completion, tab completion, and import actions. It resolves project
configuration, imported files, and dependency declarations through LVCE's
filesystem. Virtual URI files explicitly select their containing configured project
when included, preserving options such as `lib`, `strict`, and `noUnusedLocals`.
Synthetic WASM root probes stay outside the host filesystem for virtual projects;
Windows file projects reject probes without a drive or network host. Compiler paths
use the drive-letter spelling expected by the official URI codec, while editor
locations and rename edits retain the original open-document URI. Current document contents take precedence over stored files. The
optional application-bundled native TS7 server remains available on native hosts.

The adapter uses the official AST, type checker, semantic reference API, and import
edit API. It does not depend on the TS6 language service. Completion resolution
includes types, JSDoc, and function arguments; library definitions open the bundled
TS7 declarations. Project-export suggestions also work for virtual files, where
the upstream auto-import index currently follows an inferred default project.
Rename uses semantic references and preserves object shorthand property names.

Quick fixes cover spelling suggestions, unused imports, missing imports, and missing
object properties. The experimental API does not yet expose the full language-server
quick-fix catalog. Missing-import actions only choose unambiguous exports already in
the project; discovery of arbitrary unreferenced packages is still limited. Import
cleanup removes unused bindings and preserves side-effect imports and embedded
comments. It does not yet merge or reorder import declarations. Closing-tag and
semantic-token providers were not registered before this migration and remain so.

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
  diagnostic scenarios plus the existing hover, navigation, reference, rename,
  implementation, selection, comment, brace, and source-action regressions, and new
  symbol/signature coverage. TS6 cache-internal tests remain separate because TS7
  uses fresh snapshots.
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

## Initial comparison

Three alternating local trials on November 3, 2026 used Chrome 151.0.7922.34,
fresh browser contexts, the same static host without isolation headers, and the
same multi-file fixture with dependency declarations and unsaved edits. OS file
caches were retained. Each trial includes three completion requests and five
diagnostic requests. The table reports the median across trials; repeated-request
rows first take the median within each trial. All six scenarios passed with no
failed HTTP requests and `crossOriginIsolated === false`.

| Worker operation       |      TS6 | TS7 WASM |
| ---------------------- | -------: | -------: |
| Initialization         |   340 ms |   543 ms |
| First diagnostics      | 1,283 ms | 1,603 ms |
| Subsequent diagnostics |    74 ms |   276 ms |
| Completion             |    37 ms |   357 ms |

TS7 is slower on this fixture, particularly while editing. Fresh snapshots trade
incremental reuse for straightforward filesystem consistency. These worker
measurements exclude editor rendering and browser startup and are not a
large-project benchmark. Handler timing boundaries also differ slightly: the TS6
instrumentation wraps its existing worker commands, while TS7 records the backend
operation after collecting open editor URIs. Do not interpret the ratios as
isolated compiler-speed comparisons.

The TS7 worker's allocated WASM linear memory reached 99,090,432 bytes across these
trials. This is not the page's JavaScript heap or total browser memory; no
comparable TS6 worker-memory measurement was taken.

[Raw results](typescript-7-web-comparison.json) record every sample and the exact
commits. The TS6 baseline is commit `24963d316ef4` with the same OPFS text-handle
repair and measurement wrappers, preserved in
[the baseline patch](typescript-7-web-baseline.patch). Neither compiler was
modified. The common scenario excludes the additional syntax-diagnostic assertion
covered by the TS7 acceptance test.

To reproduce, prepare isolated baseline and candidate checkouts and install their
dependencies. Apply the baseline patch to the baseline checkout, copy the
`ts7-web` fixture and
[`typescript.ts-web-benchmark.ts`](../scripts/fixtures/typescript.ts-web-benchmark.ts)
into each checkout's e2e fixtures and source folders, and copy
`scripts/test-ts7-static.mjs` to the baseline. Build each extension and static site,
then alternate runs of
`TS_WEB_TEST=typescript.ts-web-benchmark node scripts/test-ts7-static.mjs` in the
two checkouts. Use the same Chrome executable through `CHROMIUM_EXECUTABLE_PATH`.
CI saves its normal TS7 acceptance measurements separately.
