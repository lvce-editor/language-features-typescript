export class CommandNotFoundError extends Error {
  constructor(id) {
    super(`Command ${id} not found`)
    this.name = 'CommandNotFoundError'
    // this.code = ErrorCodes.E_COMMAND_NOT_FOUND
  }
}
