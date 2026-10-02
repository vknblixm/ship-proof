import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  console.error('Missing required environment variables:')
  console.error('  NEXT_PUBLIC_SANITY_PROJECT_ID:', projectId ? '✓' : '✗')
  console.error('  NEXT_PUBLIC_SANITY_DATASET:', dataset ? '✓' : '✗')
  console.error('  SANITY_WRITE_TOKEN:', token ? '✓' : '✗')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-10-01',
  useCdn: false,
  token,
})

interface SeedDocument {
  _type: string
  title: string
  slug: {
    _type: string
    current: string
  }
  targetNodeVersion: string
  dependencies: Array<{
    name: string
    version: string
    deprecated: boolean
  }>
  status: 'CLEAN' | 'BROKEN' | 'DRIFT'
}

const seeds: SeedDocument[] = [
  {
    _type: 'releaseCandidate',
    title: 'Clean Release Candidate',
    slug: {
      _type: 'slug',
      current: 'v1-clean',
    },
    targetNodeVersion: '^20.0.0',
    dependencies: [
      { name: 'react', version: '19.0.0', deprecated: false },
      { name: 'react-dom', version: '19.0.0', deprecated: false },
      { name: 'next', version: '15.0.0', deprecated: false },
    ],
    status: 'CLEAN',
  },
  {
    _type: 'releaseCandidate',
    title: 'Broken Release Candidate',
    slug: {
      _type: 'slug',
      current: 'v1-broken',
    },
    targetNodeVersion: '^20.0.0',
    dependencies: [
      { name: 'old-package', version: '0.1.0', deprecated: true },
      { name: 'legacy-lib', version: '1.0.0', deprecated: true },
    ],
    status: 'BROKEN',
  },
  {
    _type: 'releaseCandidate',
    title: 'Drift Release Candidate',
    slug: {
      _type: 'slug',
      current: 'v1-drift',
    },
    targetNodeVersion: '^20.0.0',
    dependencies: [
      { name: 'react', version: '19.0.0', deprecated: false },
    ],
    status: 'DRIFT',
  },
]

async function seedDatabase() {
  console.log('🌱 Starting Sanity seeding for SHIP//PROOF...')
  console.log(`   Project: ${projectId}`)
  console.log(`   Dataset: ${dataset}\n`)

  try {
    for (const doc of seeds) {
      const created = await client.create(doc)
      console.log(`✓ Seeded: ${doc.slug.current} (ID: ${created._id})`)
    }
    console.log('\n✅ All seeds planted successfully!')
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Seeding failed:', error.message)
    } else {
      console.error('❌ Seeding failed:', error)
    }
    process.exit(1)
  }
}

seedDatabase()
