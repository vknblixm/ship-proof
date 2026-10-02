'use client'

import { useState } from 'react'

type VerificationResponse = {
  ok: boolean
  sanityRecord?: {
    _id?: string
    slug: string
    title: string
  }
  result?: {
    verdict: 'SHIP' | 'BLOCKED' | 'DRIFT'
    reasons: string[]
  }
  error?: string
}

export default function ShipProofDashboard() {
  const [slug, setSlug] = useState('v1-clean')
  const [nodeVer, setNodeVer] = useState('20.10.0')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResponse | null>(null)

  const runVerification = async (selectedSlug: string, runtimeNode: string) => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/verify?slug=${encodeURIComponent(selectedSlug)}&nodeVersion=${encodeURIComponent(runtimeNode)}`
      )
      const data: VerificationResponse = await res.json()
      setResult(data)
    } catch (error) {
      console.error(error)
      setResult({
        ok: false,
        error: 'Unable to query verification endpoint.',
        result: {
          verdict: 'BLOCKED',
          reasons: ['Unable to query verification endpoint.'],
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const verdictStyles = {
    SHIP: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50',
    BLOCKED: 'bg-rose-500/20 text-rose-400 border border-rose-500/50',
    DRIFT: 'bg-amber-500/20 text-amber-400 border border-amber-500/50',
  } as const

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8 font-mono">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400">SHIP//PROOF Engine</h1>
          <p className="mt-1 text-sm text-slate-400">
            Deterministic release verification via Sanity Content Lake and policy evaluation
          </p>
        </header>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-200">Sandbox presets</h2>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const nextSlug = 'v1-clean'
                const nextNode = '20.10.0'
                setSlug(nextSlug)
                setNodeVer(nextNode)
                runVerification(nextSlug, nextNode)
              }}
              className="rounded border border-emerald-500/40 bg-emerald-600/20 px-4 py-2 text-emerald-300 transition hover:bg-emerald-600/30"
            >
              Preset: CLEAN (v1-clean)
            </button>

            <button
              onClick={() => {
                const nextSlug = 'v1-broken'
                const nextNode = '18.0.0'
                setSlug(nextSlug)
                setNodeVer(nextNode)
                runVerification(nextSlug, nextNode)
              }}
              className="rounded border border-rose-500/40 bg-rose-600/20 px-4 py-2 text-rose-300 transition hover:bg-rose-600/30"
            >
              Preset: BROKEN (v1-broken)
            </button>

            <button
              onClick={() => {
                const nextSlug = 'v1-drift'
                const nextNode = '20.10.0'
                setSlug(nextSlug)
                setNodeVer(nextNode)
                runVerification(nextSlug, nextNode)
              }}
              className="rounded border border-amber-500/40 bg-amber-600/20 px-4 py-2 text-amber-300 transition hover:bg-amber-600/30"
            >
              Preset: DRIFT (v1-drift)
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-slate-400">Release slug</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500"
                placeholder="v1-clean"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-400">Node runtime version</span>
              <input
                value={nodeVer}
                onChange={(e) => setNodeVer(e.target.value)}
                className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500"
                placeholder="20.10.0"
              />
            </label>
          </div>

          <div className="mt-6">
            <button
              onClick={() => runVerification(slug, nodeVer)}
              disabled={loading}
              className="rounded bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Verifying…' : 'Run verification'}
            </button>
          </div>
        </section>

        {loading && <div className="text-slate-400">Querying Sanity Content Lake and evaluating release rules…</div>}

        {result && (
          <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-100">Verification result</h3>
              <span
                className={`rounded px-3 py-1 text-sm font-bold ${
                  verdictStyles[result.result?.verdict || 'BLOCKED']
                }`}
              >
                {result.result?.verdict || 'BLOCKED'}
              </span>
            </div>

            {result.error && <p className="mt-4 text-sm text-rose-300">{result.error}</p>}

            {result.result && (
              <div className="mt-4 text-sm">
                <p className="mb-2 text-slate-400">Reasons:</p>
                <ul className="list-inside list-disc space-y-1 text-slate-300">
                  {result.result.reasons.map((reason, index) => (
                    <li key={`${reason}-${index}`}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 border-t border-slate-800 pt-4">
              <p className="text-xs text-slate-500">Sanity record ID: {result.sanityRecord?._id || 'N/A'}</p>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
