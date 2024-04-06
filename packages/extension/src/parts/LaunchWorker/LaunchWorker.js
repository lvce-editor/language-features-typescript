export const launchWorker = async ({ url, name, contentSecurityPolicy }) => {
  // @ts-expect-error
  const rpc = await vscode.createRpc({
    type: 'worker',
    url: url,
    name,
    contentSecurityPolicy,
  })
  return rpc
}
