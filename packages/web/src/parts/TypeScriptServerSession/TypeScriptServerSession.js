/**
 *
 * @param {import('typescript/lib/tsserverlibrary.js')} ts
 * @param {import('typescript/lib/tsserverlibrary.js').server.ServerHost} host
 */
export const create = (ts, host) => {
  const session = new ts.server.Session({
    useInferredProjectPerProjectRoot: true,
    useSingleInferredProject: true,
    byteLength() {
      throw new Error('Not implemented')
    },
    cancellationToken: {
      isCancellationRequested() {
        return false
      },
      resetRequest(requestId) {},
      setRequest(requestId) {},
    },
    canUseEvents: true,
    host,
    hrtime(start) {
      return start
    },
    logger: {
      close() {},
      endGroup() {},
      getLogFileName() {
        return ''
      },
      hasLevel(level) {
        return true
      },
      info(s) {},
      loggingEnabled() {
        return false
      },
      msg(s) {},
      perftrc(s) {},
      startGroup() {},
    },
  })
  return session
}
