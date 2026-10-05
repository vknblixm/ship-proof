import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'demo-project'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2026-10-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

export const GET_RELEASE_CANDIDATE = `
  *[_type == "releaseCandidate" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    targetNodeVersion,
    dependencies[] {
      name,
      version,
      deprecated
    },
    status
  }
`

export interface ReleaseCandidateRecord {
  _id?: string
  slug: string
  title: string
  targetNodeVersion: string
  dependencies: Array<{
    name: string
    version: string
    deprecated: boolean
  }>
  status: 'CLEAN' | 'BROKEN' | 'DRIFT'
}

const fallbackReleaseCandidates: Record<string, ReleaseCandidateRecord> = {
  'v1-clean': {
    _id: 'fallback-v1-clean',
    slug: 'v1-clean',
    title: 'Clean Release Candidate',
    targetNodeVersion: '^20.0.0',
    dependencies: [{ name: 'react', version: '19.0.0', deprecated: false }],
    status: 'CLEAN',
  },
  'v1-broken': {
    _id: 'fallback-v1-broken',
    slug: 'v1-broken',
    title: 'Broken Release Candidate',
    targetNodeVersion: '^20.0.0',
    dependencies: [{ name: 'old-pkg', version: '0.1.0', deprecated: true }],
    status: 'BROKEN',
  },
  'v1-drift': {
    _id: 'fallback-v1-drift',
    slug: 'v1-drift',
    title: 'Drift Release Candidate',
    targetNodeVersion: '^20.0.0',
    dependencies: [],
    status: 'DRIFT',
  },
}

export function getFallbackReleaseCandidate(slug: string): ReleaseCandidateRecord | null {
  return fallbackReleaseCandidates[slug] ?? null
}

export async function fetchReleaseCandidate(slug: string): Promise<ReleaseCandidateRecord | null> {
  const hasConfiguredSanity = Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'your_project_id' &&
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'your_sanity_project_id'
  )

  if (!hasConfiguredSanity) {
    return getFallbackReleaseCandidate(slug)
  }

  try {
    const record = await sanityClient.fetch<ReleaseCandidateRecord | null>(GET_RELEASE_CANDIDATE, { slug })
    return record ?? getFallbackReleaseCandidate(slug)
  } catch (error) {
    console.error('Sanity fetch error:', error)
    return getFallbackReleaseCandidate(slug)
  }
}
