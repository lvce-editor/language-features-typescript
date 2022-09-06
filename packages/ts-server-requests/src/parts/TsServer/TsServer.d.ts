export interface TsServer {
  readonly invoke: <Request, Response>(params: Request) => Promise<Response>
}
