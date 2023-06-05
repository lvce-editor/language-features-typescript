export const getTsServerArgv = ({ disableAutomaticTypingAcquisition = true, npmLocation = '' }) => {
  const argv = []
  argv.push('--useInferredProjectPerProjectRoot')
  if (disableAutomaticTypingAcquisition) {
    argv.push('--disableAutomaticTypingAcquisition')
  }
  if (npmLocation) {
    argv.push('--npmLocation', `${npmLocation}`)
  }
  argv.push('--locale', 'en')
  argv.push('--noGetErrOnBackgroundUpdate')
  argv.push('--validateDefaultNpmLocation')
  argv.push('--suppressDiagnosticEvents')

  const execArgv = ['--max-old-space-size=200']
  return {
    argv,
    execArgv,
  }
}
