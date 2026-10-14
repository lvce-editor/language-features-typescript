import { readFile, writeFile } from 'node:fs/promises'

const bundle = new URL(
  '../node_modules/@lvce-editor/static-server/static/527de2a/packages/editor-worker/dist/editorWorkerMain.js',
  import.meta.url,
)
let source = await readFile(bundle, 'utf8')
const replaceOnce = (before, after) => {
  if (source.split(before).length !== 2) {
    throw new Error(`Expected exactly one diagnostics capture target: ${before}`)
  }
  source = source.replace(before, after)
}

replaceOnce(
  '  if (!editor.diagnosticsEnabled || editor.loadError) {\n    return editor;\n  }',
  `  if (!editor.diagnosticsEnabled || editor.loadError) {
    if (strict) {
      throw new Error('E2E diagnostics disabled: ' + JSON.stringify({ uri: editor.uri, languageId: editor.languageId, diagnosticsEnabled: editor.diagnosticsEnabled }));
    }
    return editor;
  }`,
)
replaceOnce(
  '          if (providerCount === 0) {\n            providers.clear();',
  `          if (providerCount === 0) {
            if (strict) {
              throw new Error('E2E diagnostics completed without providers: ' + JSON.stringify({ uri: editor.uri, languageId: editor.languageId, diagnosticsEnabled: editor.diagnosticsEnabled, providerCount }));
            }
            providers.clear();`,
)

await writeFile(bundle, source)
console.info(`Installed empty Problems diagnostic assertions in ${bundle.pathname}`)
