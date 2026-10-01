// Simple filename-based classifier for dental STL roles
// Heuristics only; no geometry analysis

export type MeshRole = 'upper' | 'lower' | 'bite' | 'unknown'

const upperPatterns = [
  /\bupper\b/i,
  /\bmax(illa|illary)?\b/i,
  /\bU(\b|_|-)/i,
  /\bUL\b/i,
  /\bupp\b/i,
]

const lowerPatterns = [
  /\blower\b/i,
  /\bmand(ible|ibular)?\b/i,
  /\bL(\b|_|-)/i,
  /\bLL\b/i,
  /\blow\b/i,
]

const bitePatterns = [/\bbite\b/i, /\boccl(us(ion|al)?)?\b/i, /\bregistration\b/i, /\bbuccal\b/i]

export function classifyMeshName(nameOrUrl: string): MeshRole {
  const s = (nameOrUrl || '').toLowerCase()
  if (!s) return 'unknown'
  if (bitePatterns.some((p) => p.test(s))) return 'bite'
  if (upperPatterns.some((p) => p.test(s))) return 'upper'
  if (lowerPatterns.some((p) => p.test(s))) return 'lower'
  return 'unknown'
}

export function sortRoles(a: MeshRole, b: MeshRole): number {
  const order: Record<MeshRole, number> = {upper: 0, lower: 1, bite: 2, unknown: 3}
  return order[a] - order[b]
}
