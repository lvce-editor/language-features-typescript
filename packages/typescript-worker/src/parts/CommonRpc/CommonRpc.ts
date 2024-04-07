export interface CommonRpc {
  readonly invoke: <T>(method: string, ...params: any[]) => Promise<T>
}
