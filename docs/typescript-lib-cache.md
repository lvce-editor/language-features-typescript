# TypeScript library OPFS experiment

The build hashes the retained `lib*.d.ts` assets and embeds one manifest in the
worker. Initialization stores the declarations in one hash-keyed OPFS file,
verifies their contents, and opens a synchronous read handle. Web Locks serialize
population. The completion header is written last; incomplete or corrupt entries
are rebuilt. Unavailable storage falls back to the existing synchronous XHR path.
Project files continue to use the existing filesystem bridge.

Declaration fetches must use `Accept: text/plain`: the development server otherwise
transpiles TypeScript, which changes the declaration bytes. Both normal and static
builds use the same manifest and relocate library URLs with the existing bundler.

## Local measurement (2026-09-23)

A headless Chromium worker loaded the current 108 declarations (3,784,758 bytes,
plus a 128-byte cache header), then requested completions for `win` using either
OPFS snapshots or the existing XHR snapshot path. A second worker on the same
origin tested a warm restart. Both paths returned 1,050 entries, including
`PictureInPictureWindow`.

| Measurement                           | Cold worker | Warm worker |
| ------------------------------------- | ----------: | ----------: |
| OPFS initialization                   |    295.2 ms |     14.6 ms |
| Library fetches during initialization |         108 |           0 |
| OPFS first completion                 |    489.2 ms |    423.5 ms |
| XHR first completion                  |    450.9 ms |    414.7 ms |
| Library XHRs for OPFS completion      |           0 |           0 |
| Library XHRs for XHR completion       |          18 |          18 |

These are individual local samples, with OPFS measured first and XHR second in
each worker, not a controlled statistical comparison. They demonstrate elimination
of library requests on warm startup, but do **not** demonstrate an overall latency
improvement. Cold initialization downloads all libraries, including those a given
project may never use. Parsing still dominates this completion scenario. Retained
cache versions consume storage until the browser evicts them; automatic old-version
cleanup is not part of this experiment.

The real extension completion test also passes with the cache enabled. Existing
completion, diagnostics and DOM-reference end-to-end coverage remains required in
CI, alongside unit tests and normal/static builds.
