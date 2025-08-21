export const createBuffer = (isolated: boolean): Int32Array | undefined => {
  if (!isolated) {
    return undefined
  }
  return new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT))
}
