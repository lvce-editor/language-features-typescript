import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const target = require.resolve('@lvce-editor/test-with-playwright-worker')
let source = await readFile(target, 'utf8')
const replaceOnce = (before, after) => {
  if (source.split(before).length !== 2) throw new Error(`Expected one diagnostic patch target: ${before}`)
  source = source.replace(before, after)
}
replaceOnce(
  '  try {\n    if (traceRendererWorker) {',
  `  const diagnosticMessages = [];
  const captureDiagnostic = message => {
    const text = message.text();
    if (!text.startsWith('LVCE_TS_DIAGNOSTIC ')) return;
    diagnosticMessages.push({ sequence: diagnosticMessages.length, observedAt: Date.now(), testUrl: page.url(), event: JSON.parse(text.slice('LVCE_TS_DIAGNOSTIC '.length)) });
  };
  page.on('console', captureDiagnostic);
  try {
    if (traceRendererWorker) {`,
)
replaceOnce(
  `  } finally {
    try {
      await tearDownTests({
        child,
        controller
      });
    } finally {
      await dispose();
    }
  }
};

const RunAllTests`,
  `  } finally {
    page.off('console', captureDiagnostic);
    try {
    const directory = join(cwd, 'typescript-diagnostics', browser);
    await mkdir(directory, { recursive: true });
    const byTest = new Map();
    for (const message of diagnosticMessages) {
      const test = new URL(message.testUrl).pathname.split('/').pop().replace(/[^a-zA-Z0-9._-]/g, '_');
      if (!byTest.has(test)) byTest.set(test, []);
      byTest.get(test).push(message);
    }
    for (const [test, messages] of byTest) {
      await writeFile(join(directory, 'allmessages-' + test + '-' + (process.env.DIAGNOSTIC_ATTEMPT || 'local') + '.json'), JSON.stringify(messages, null, 2));
    }
    await writeFile(join(directory, 'capture-summary.json'), JSON.stringify({ count: diagnosticMessages.length, tests: byTest.size }));
    } finally {
      try {
        await tearDownTests({ child, controller });
      } finally {
        await dispose();
      }
    }
  }
};

const RunAllTests`,
)
await writeFile(target, source)
console.info(`Patched TypeScript diagnostic capture in ${target}`)
