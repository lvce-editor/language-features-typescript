interface TsServer<Request, Response> {
  readonly invoke: (message: Request) => Promise<Response>
}

interface TsServerProcess {
  readonly dispose: () => void
}

interface TsServerProcessOptions {
  readonly tsServerPath: string
}

export const TsServerProcess: {
  readonly create: (options: TsServerProcessOptions) => TsServerProcess
  readonly dispose: () => void
}

export const TsServer: {
  readonly create: (tsServerProcess: TsServerProcess) => TsServer
}
