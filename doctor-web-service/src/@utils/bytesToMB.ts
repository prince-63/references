export const bytesToMB = (bytes: number): number => {
  const result = bytes / (1024 * 1024)
  return Number(result.toFixed(2))
}
