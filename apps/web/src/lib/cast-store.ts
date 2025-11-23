type StoredCast = {
  id: string
  fid: number
  text: string
  createdAt: number
  hubResponse: any
}

const CASTS_KEY = 'farkee:casts'

// Simple in-memory store (not persistent)
const casts: StoredCast[] = []

export function addCast(entry: Omit<StoredCast, 'id' | 'createdAt'>) {
  const record: StoredCast = {
    id: String(Date.now()) + Math.random().toString(36).slice(2,8),
    createdAt: Date.now(),
    ...entry,
  }
  casts.unshift(record)
  // keep only last 200
  if (casts.length > 200) casts.splice(200)
  return record
}

export function getRecentCasts(limit = 20) {
  return casts.slice(0, limit)
}

export function clearCasts() {
  casts.length = 0
}

export type { StoredCast }
