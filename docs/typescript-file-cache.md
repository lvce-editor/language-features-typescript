# TypeScript source-content cache experiment

The TypeScript worker opens two exclusive synchronous OPFS journals, `files-v1` and
`node-modules-v1`, through the extension `getCacheFileHandle` API. Cache-worker owns
the directory layout; extension-management-worker derives the extension namespace
from the owning extension ID. Each TypeScript worker owns and closes its access
handles. A competing worker falls back to its source transport while the lock is
held. Terminating the owning worker releases its browser-managed locks.

The existing manifest-validated library cache remains separate and unchanged.
Each new journal retains at most 16 MiB or 4096 content entries. It resets at the
bound rather than retaining unbounded history. Entries contain a byte length,
SHA256 identity and UTF-8 contents. Publication writes the header last; reopening
truncates incomplete tails. Every cache hit verifies the stored bytes. Corruption,
quota errors, short writes and unavailable storage fall back to source reads.
Contents read after a concurrent source change cannot be stored under the earlier
hash.

Every persistent read first asks `getFileHashes` for the current source identity.
The disk provider caches SHA256 by device/inode/size/mtime/ctime, checking metadata
around the initial content read. Subsequent unchanged identities use stat calls.
Non-disk URIs are hashed through their owning read provider because the legacy
disk hash API rejects other schemes: fewer
TypeScript source RPCs do not imply fewer provider reads in those environments.
In-memory documents take precedence over saved contents. Before reusing a project,
the client refreshes read identities, missing-path existence and directory listings;
changes or failed validation discard its language services and resolution state.

Diagnostic performance traces include `fileCache`: cumulative counters for the
current worker (`generalHits`, `dependencyHits`, `sourceReads`, `identityRequests`,
`identitiesChecked`) and whether each journal was opened. Compare snapshots for
per-request deltas. These are counts at the TypeScript cache boundary, not disk
I/O counters. Library requests use the existing independent cache.

## Measurements

Run `PLAYWRIGHT_BROWSERS_PATH=0 node scripts/benchmark-file-cache.mjs` after installing
Chromium. The script uses the production cache/client, language host and TypeScript
in fresh dedicated browser workers. The fixed project imports 20 source files and
20 declaration files and must produce the same 20 type errors in every run. It
also verifies concurrent-lock fallback, termination/reopen and corrupt-entry repair.
The integrated `typescript.file-cache` and `typescript.file-cache-disk` end-to-end
cases separately exercise actual extension API routing, memory/disk providers,
dependency/source edits, missing paths/recreation and an unsaved document. The disk
case renames a source away before recreating it; the memory case removes it. Disk
fixtures use OS temporary directories, avoiding the desktop trash service in
headless tests.

The benchmark source transport is synchronous HTTP to a local filesystem server,
not the application's shared RPC. Its server uses a stat-validated SHA256 map, and
reports content reads for hashing separately. The pre-existing library cache is
warm in all compared cases. Each repetition clears the new OPFS journals and
server hash map, then runs baseline (new cache disabled), cold, and a fresh worker
with warm persistent caches. This fixed ordering and local transport limit any
performance conclusion.

Chromium on Linux, 2026-10-03, five repetitions (milliseconds):

| Case         | Diagnostic times             | Median | Initialization times    |
| ------------ | ---------------------------- | ------ | ----------------------- |
| Baseline     | 1735, 1570, 1678, 1545, 1561 | 1570   | 304, 296, 343, 311, 381 |
| Cold         | 1736, 2094, 1950, 1858, 1797 | 1858   | 296, 303, 323, 365, 311 |
| Warm restart | 1682, 1565, 1539, 1666, 1619 | 1619   | 318, 336, 329, 306, 326 |

Every baseline run made 40 source reads; cold runs made 40 source reads plus 40
identity requests and 40 initial hash-content reads. Every warm restart made zero
source reads and zero hash-content reads, with 40 identity requests, 20 general
cache hits and 20 dependency cache hits. All compared runs made zero library
requests. The concurrent worker safely made 40 source reads; after terminating the
lock owner the next worker made zero. Corrupting one body caused exactly one source
read, and the following restart again made zero.

These measurements show persistent reuse and its validation cost. They do **not**
establish faster diagnostics: the warm median was slightly slower than baseline,
and the cold median was slower still. No end-to-end speedup is claimed.
