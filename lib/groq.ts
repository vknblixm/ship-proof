import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'your_project_id',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-10-01',
  useCdn: false,
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

export async function fetchReleaseCandidate(slug: string): Promise<ReleaseCandidateRecord | null> {
  try {
    return await sanityClient.fetch<ReleaseCandidateRecord | null>(GET_RELEASE_CANDIDATE, { slug })
  } catch (error) {
    console.error('Sanity fetch error:', error)
    return null
  }
}
