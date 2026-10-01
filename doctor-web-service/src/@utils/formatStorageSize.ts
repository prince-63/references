export const formatStorageSize = (usedStorageGB: number, toFixed: number = 3): string => {
  if (usedStorageGB > 100) {
    return `${(usedStorageGB / 1024).toFixed(toFixed)} GB`
  } else {
    return `${usedStorageGB.toFixed(toFixed)} MB`
  }
}
