import { NextRequest, NextResponse } from 'next/server'
import { fetchReleaseCandidate } from '@/lib/groq'
import { evalShippability, ReleaseCandidateData } from '@/lib/evaluator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug') || 'v1-clean'
    const nodeVersion = searchParams.get('nodeVersion') || '20.10.0'

    const record = await fetchReleaseCandidate(slug)

    if (!record) {
      return NextResponse.json(
        {
          ok: false,
          error: `No Sanity record found for slug '${slug}'.`,
          result: {
            verdict: 'BLOCKED',
            reasons: [`No candidate found for slug '${slug}'.`],
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      )
    }

    const candidate: ReleaseCandidateData = {
      slug: record.slug,
      title: record.title,
      targetNodeVersion: record.targetNodeVersion,
      dependencies: record.dependencies.map((dep) => ({
        name: dep.name,
        version: dep.version,
        deprecated: Boolean(dep.deprecated),
      })),
      status: record.status,
    }

    const result = evalShippability(candidate, nodeVersion)

    return NextResponse.json({
      ok: true,
      sanityRecord: record,
      result,
    })
  } catch (error) {
    console.error('Verification route error:', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Verification failed unexpectedly.',
        result: {
          verdict: 'BLOCKED',
          reasons: ['Unexpected verification failure.'],
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    )
  }
}
