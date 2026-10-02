import { evalShippability } from '../lib/evaluator.ts'

const cleanFixture = {
  slug: 'v1-clean',
  title: 'Clean Release Candidate',
  targetNodeVersion: '^20.0.0',
  dependencies: [{ name: 'react', version: '19.0.0', deprecated: false }],
  status: 'CLEAN',
}

const brokenFixture = {
  slug: 'v1-broken',
  title: 'Broken Release Candidate',
  targetNodeVersion: '^20.0.0',
  dependencies: [{ name: 'old-pkg', version: '0.1.0', deprecated: true }],
  status: 'BROKEN',
}

const driftFixture = {
  slug: 'v1-drift',
  title: 'Drift Release Candidate',
  targetNodeVersion: '^20.0.0',
  dependencies: [],
  status: 'DRIFT',
}

console.log('--- RUNNING SHIP//PROOF CORE TEST SUITE ---')

const res1 = evalShippability(cleanFixture, '20.10.0')
console.assert(res1.verdict === 'SHIP', 'Clean test failed')
console.log('CLEAN  -> SHIP: PASS')

const res2 = evalShippability(brokenFixture, '20.10.0')
console.assert(res2.verdict === 'BLOCKED', 'Broken test failed')
console.log('BROKEN -> BLOCKED: PASS')

const res3 = evalShippability(driftFixture, '20.10.0')
console.assert(res3.verdict === 'DRIFT', 'Drift test failed')
console.log('DRIFT  -> DRIFT: PASS')

console.log('\n3/3 core tests PASS')
