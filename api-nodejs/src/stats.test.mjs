import assert from 'node:assert'
import { computeStats } from './util.mjs'

// Simple unit test executable via: node src/stats.test.mjs

const input = [
  [ [1,0], [0,2] ],
  [ [3,4], [5,6] ]
]

const out = computeStats(input)
assert.equal(out.min, 0)
assert.equal(out.max, 6)
assert.equal(out.sum, 21)
assert(Math.abs(out.average - (21/7)) < 1e-9)
assert.equal(out.anyDiagonal, true)

console.log('stats unit test ok')


