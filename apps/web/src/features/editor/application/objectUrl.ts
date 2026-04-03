export function scheduleObjectUrlRevoke(objectUrl?: string | null) {
  if (!objectUrl) {
    return
  }

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 0)
}
