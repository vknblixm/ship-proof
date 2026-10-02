export interface Dependency {
  name: string
  version: string
  deprecated: boolean
}

export interface ReleaseCandidateData {
  slug: string
  title: string
  targetNodeVersion: string
  dependencies: Dependency[]
  status: 'CLEAN' | 'BROKEN' | 'DRIFT'
}

export interface VerificationResult {
  verdict: 'SHIP' | 'BLOCKED' | 'DRIFT'
  reasons: string[]
  timestamp: string
}

function normalizeVersion(input: string): string {
  return input.trim().replace(/^v/i, '')
}

function parseVersion(version: string): { major: number; minor: number; patch: number } | null {
  const normalized = normalizeVersion(version)
  const match = normalized.match(/^(\d+)\.(\d+)\.(\d+)/)

  if (!match) return null

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  }
}

function compareVersions(a: string, b: string): number {
  const av = parseVersion(a)
  const bv = parseVersion(b)

  if (!av || !bv) return 0

  if (av.major !== bv.major) return av.major - bv.major
  if (av.minor !== bv.minor) return av.minor - bv.minor
  return av.patch - bv.patch
}

function matchesRange(version: string, range: string): boolean {
  const target = normalizeVersion(version)
  const cleanRange = range.trim()

  if (!cleanRange) return false

  if (cleanRange.startsWith('^')) {
    const base = cleanRange.replace('^', '')
    const baseVersion = parseVersion(base)
    const current = parseVersion(target)

    if (!baseVersion || !current) return false
    return current.major === baseVersion.major
  }

  if (cleanRange.startsWith('~')) {
    const base = cleanRange.replace('~', '')
    const baseVersion = parseVersion(base)
    const current = parseVersion(target)

    if (!baseVersion || !current) return false
    return current.major === baseVersion.major && current.minor === baseVersion.minor
  }

  if (cleanRange.includes('>=')) {
    const minVersion = cleanRange.replace('>=', '').trim()
    return compareVersions(target, minVersion) >= 0
  }

  if (cleanRange.includes('<=')) {
    const maxVersion = cleanRange.replace('<=', '').trim()
    return compareVersions(target, maxVersion) <= 0
  }

  const exactVersion = parseVersion(cleanRange)
  const current = parseVersion(target)

  if (!exactVersion || !current) return false

  return (
    current.major === exactVersion.major &&
    current.minor === exactVersion.minor &&
    current.patch === exactVersion.patch
  )
}

export function evalShippability(data: ReleaseCandidateData, currentNodeVersion: string): VerificationResult {
  const reasons: string[] = []
  let hasBlockers = false
  let hasDrift = false

  const runtimeMatches = matchesRange(currentNodeVersion, data.targetNodeVersion)

  if (!runtimeMatches) {
    reasons.push(
      `Node runtime mismatch: System running ${currentNodeVersion}, target policy requires ${data.targetNodeVersion}`
    )
    hasBlockers = true
  }

  data.dependencies.forEach((dep) => {
    if (dep.deprecated) {
      reasons.push(`Forbidden dependency detected: '${dep.name}@${dep.version}' is deprecated.`)
      hasBlockers = true
    }
  })

  if (data.status === 'BROKEN') {
    reasons.push('Release candidate explicitly marked BROKEN in Sanity.')
    hasBlockers = true
  }

  if (data.status === 'DRIFT') {
    reasons.push('Sanity Knowledge Base flagged environment drift between production spec and runtime.')
    hasDrift = true
  }

  if (hasBlockers) {
    return {
      verdict: 'BLOCKED',
      reasons,
      timestamp: new Date().toISOString(),
    }
  }

  if (hasDrift) {
    return {
      verdict: 'DRIFT',
      reasons,
      timestamp: new Date().toISOString(),
    }
  }

  return {
    verdict: 'SHIP',
    reasons: ['All deterministic checks passed against Sanity Content Lake.'],
    timestamp: new Date().toISOString(),
  }
}
