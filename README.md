# Language Features TypeScript

## Contributing

```sh
git clone git@github.com:lvce-editor/language-features-typescript.git &&
cd language-features-typescript &&
npm ci &&
npm test
```

## Credits

This extension is based on https://github.com/microsoft/vscode/tree/main/extensions/typescript-language-features by Microsoft (License MIT)

### TypeScript 7

Set `"typescript.useTs7": true` and reload the window to use LVCE's bundled native TypeScript 7 language server. The default remains the TypeScript web worker. The native server requires a desktop or server host; a static browser deployment cannot launch it. Missing or unsupported native hosts report a language-server error rather than starting a second backend.

The application owns the executable and its standard libraries. No native TypeScript executable is included in `extension.tar.br`. Native mode uses LSP completion, diagnostics, navigation, hover, signature help, rename, symbols, formatting and code actions when the server advertises support. Editor-specific brace, closing-tag, tab and selection providers are unavailable in this mode. Worker performance/cache commands apply only to the default backend. Reloading also disposes the previous server.
