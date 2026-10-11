# TypeScript completion responsiveness

Diagnostic providers coalesce requests per URI and document ID before dispatch to
TypeScript's synchronous worker. A 150 ms quiet period avoids dispatching every
keystroke. An executing analysis finishes; only the newest waiting document then
runs. Superseded requests resolve with no results, and the editor's existing
request-generation checks prevent their application. Separate documents and tabs
have separate queues. Provider failures release the queue for subsequent requests.

Language hosts reuse unchanged module resolutions during ordinary text edits.
Creating or releasing an unsaved override still invalidates failed lookups, and
external file/config/dependency changes still retire affected language services.
Snapshots are reused by script version through weak references: the TypeScript
program/registry owns their lifetime. Historical snapshot keys are bounded to
4096 per host. Failed reads are not cached. Directory snapshots validated in the
same refresh can disprove absent paths without individual existence RPCs; unsafe
names, unsupported listings and positive probes retain conservative fallbacks.

No lockfile-only or watcher-dependent validity mode is introduced. A lockfile does
not detect manual declaration edits, and a reliable watcher/invalidation protocol
is not necessary for these optimizations. Existing validation observes external
source and dependency edits, missing files and recreation without a lockfile or
watcher. Unsaved text retains priority over disk contents.

## Measurements

Run `node scripts/benchmark-threejs.mjs` at the repository root. Set
`THREEJS_SOURCE_ROOT` to a baseline source checkout to compare the same harness,
runtime, transport and pinned declarations. `THREEJS_ENFORCE_REUSE=1` asserts that
warm edits make at most ten source-content RPCs, in addition to asserting correct
diagnostics and the `setHex` completion. PR CI runs this on every OS. Integrated
browser coverage uses the same pinned Three.js graph, checks repeated-edit reads,
then opens actual editor completions. Disk and memory file-cache cases separately
exercise external edits, deletion/recreation and unsaved text.

Linux, Node 24.15.0, TypeScript 6.0.3, @types/three 0.186.0, 2026-10-11.
Three cold runs and fifteen warm edits per case. Baseline commit 2be65b4dbf96.
The representative graph contains 498 source/library files.

| Measurement                             | Baseline | Candidate |
| --------------------------------------- | -------: | --------: |
| Cold diagnostic median                  |   711 ms |    712 ms |
| Warm diagnostic median                  |   179 ms |     44 ms |
| Completion median after diagnostics     |    14 ms |     12 ms |
| Source-content calls on final warm edit |      418 |         3 |
| Identity requests on final warm edit    |      420 |         5 |
| Existence calls on final warm edit      |      665 |        94 |
| Directory calls on final warm edit      |      141 |       108 |

This native-disk harness measures synchronization CPU and transport-boundary calls,
not end-to-end application latency. Its hash provider rereads content to calculate
SHA256; the application provider can reuse hashes after metadata validation.
Cold runs share the Node process and module loading, and baseline/candidate runs
were sequential. No cold-start improvement or exact application speedup is claimed.
The main responsiveness benefit is less synchronous work plus fewer obsolete
analyses ahead of completion requests. Installed-application acceptance remains
required before completing the card.
