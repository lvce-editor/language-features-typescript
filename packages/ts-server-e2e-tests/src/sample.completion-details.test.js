import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.completion-details', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.completion-details')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.completionDetails(server, {
      file: join(fixture, 'src', 'index.ts'),
      entryNames: [
        {
          name: 'addEventListener',
        },
      ],
      line: 1,
      offset: 11,
    })
  ).toEqual([
    {
      displayParts: [
        { kind: 'punctuation', text: '(' },
        { kind: 'text', text: 'method' },
        { kind: 'punctuation', text: ')' },
        { kind: 'space', text: ' ' },
        { kind: 'propertyName', text: 'addEventListener' },
        { kind: 'punctuation', text: '<' },
        { kind: 'typeParameterName', text: 'K' },
        { kind: 'space', text: ' ' },
        { kind: 'keyword', text: 'extends' },
        { kind: 'space', text: ' ' },
        { kind: 'keyword', text: 'keyof' },
        { kind: 'space', text: ' ' },
        { kind: 'interfaceName', text: 'WindowEventMap' },
        { kind: 'punctuation', text: '>' },
        { kind: 'punctuation', text: '(' },
        { kind: 'parameterName', text: 'type' },
        { kind: 'punctuation', text: ':' },
        { kind: 'space', text: ' ' },
        { kind: 'typeParameterName', text: 'K' },
        { kind: 'punctuation', text: ',' },
        { kind: 'space', text: ' ' },
        { kind: 'parameterName', text: 'listener' },
        { kind: 'punctuation', text: ':' },
        { kind: 'space', text: ' ' },
        { kind: 'punctuation', text: '(' },
        { kind: 'parameterName', text: 'this' },
        { kind: 'punctuation', text: ':' },
        { kind: 'space', text: ' ' },
        { kind: 'localName', text: 'Window' },
        { kind: 'punctuation', text: ',' },
        { kind: 'space', text: ' ' },
        { kind: 'parameterName', text: 'ev' },
        { kind: 'punctuation', text: ':' },
        { kind: 'space', text: ' ' },
        { kind: 'interfaceName', text: 'WindowEventMap' },
        { kind: 'punctuation', text: '[' },
        { kind: 'typeParameterName', text: 'K' },
        { kind: 'punctuation', text: ']' },
        { kind: 'punctuation', text: ')' },
        { kind: 'space', text: ' ' },
        { kind: 'punctuation', text: '=>' },
        { kind: 'space', text: ' ' },
        { kind: 'keyword', text: 'any' },
        { kind: 'punctuation', text: ',' },
        { kind: 'space', text: ' ' },
        { kind: 'parameterName', text: 'options' },
        { kind: 'punctuation', text: '?' },
        { kind: 'punctuation', text: ':' },
        { kind: 'space', text: ' ' },
        { kind: 'keyword', text: 'boolean' },
        { kind: 'space', text: ' ' },
        { kind: 'punctuation', text: '|' },
        { kind: 'space', text: ' ' },
        { kind: 'interfaceName', text: 'AddEventListenerOptions' },
        { kind: 'punctuation', text: ')' },
        { kind: 'punctuation', text: ':' },
        { kind: 'space', text: ' ' },
        { kind: 'keyword', text: 'void' },
        { kind: 'space', text: ' ' },
        { kind: 'punctuation', text: '(' },
        { kind: 'operator', text: '+' },
        { kind: 'numericLiteral', text: '1' },
        { kind: 'space', text: ' ' },
        { kind: 'text', text: 'overload' },
        { kind: 'punctuation', text: ')' },
      ],
      documentation: [
        {
          kind: 'text',
          text: `Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched.

The options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture.

When set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET.

When set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners.

When set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed.

If an AbortSignal is passed for options's signal, then the event listener will be removed when signal is aborted.

The event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture.`,
        },
      ],
      kind: 'method',
      kindModifiers: 'declare',
      name: 'addEventListener',
      tags: [],
    },
  ])
})
