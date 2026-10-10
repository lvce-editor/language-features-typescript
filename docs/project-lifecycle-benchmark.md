# TypeScript project lifecycle measurements

Measured 2026-10-10 with Electron 44.5.0, Chromium 152.0.7977.130, TypeScript 6.0.3 and identical dependency installation. Baseline source: a9f2607cde743e1f5670719bb3770c267ae7c86a. The candidate uses configurable idle disposal (default 30 seconds, no warm idle projects), saved override removal and dirty-buffer preservation.

The harness uses the production worker command map and language services in an Electron web worker, with a synthetic synchronous HTTP source transport. Each of ten cycles per project count opens projects, checks diagnostics/completion/definition/rename edits, edits a buffer, saves, closes and reopens. Candidate cycles also retire/recreate a service while preserving dirty text. Heap measurements use HeapProfiler.collectGarbage followed by Runtime.getHeapUsage in the worker target. This measures V8 heap allocations, not RSS, whole-app memory or heap snapshot file sizes. Closing uses a zero idle interval to make the experiment deterministic; the editor regression separately exercises the automatic timer and real tab inventory.

| Projects | Baseline idle MiB (mean) | Candidate idle MiB (mean) | Difference MiB | Candidate final five idle MiB (range) | Baseline reopen ms (median) | Candidate reopen ms (median) |
| -------- | ------------------------ | ------------------------- | -------------- | ------------------------------------- | --------------------------- | ---------------------------- |
| 1        | 32.273                   | 10.741                    | 21.532         | 11.215–11.299                         | 38.9                        | 467.0                        |
| 2        | 55.445                   | 11.393                    | 44.052         | 11.407–11.432                         | 37.7                        | 440.7                        |

The final five candidate cycles must span less than 512 KiB for each project count; every candidate idle sample must be smaller than its open sample. The small fixtures differ from the original about-view heap capture: these savings do not establish that its estimated 50.485 MiB retained subtree can all be reclaimed. Initial cycles include compiler/runtime warmup. Reopening after disposal rebuilds a program and costs more than keeping a warm service; users can trade retention for latency with `typescript.projectIdleTimeout` and `typescript.maxIdleProjects` (read when the worker starts). Dirty, unreadable and untitled overrides remain in memory until saved.

Run from the repository root using an installed Electron executable under an isolated Xvfb display:

```sh
ELECTRON_PATH=/path/to/electron xvfb-run -a node scripts/benchmark-project-lifecycle.mjs
LIFECYCLE_BASELINE=1 LIFECYCLE_SOURCE_ROOT=/path/to/baseline ELECTRON_PATH=/path/to/electron xvfb-run -a node scripts/benchmark-project-lifecycle.mjs
```

The script isolates Chromium user data and all four XDG application-state roots and removes the profile after closing the app. Install identical dependencies in the baseline checkout. Raw JSON and validation logs for this execution are retained in the Trello attempt evidence directory.
