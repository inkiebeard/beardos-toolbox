import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { chunkArray, timeFormat, timeSinceString, generateRandomString, settledSeparator } from './misc-js-funcs.ts'

describe('chunkArray', () => {
  it('splits into chunks of the given size', () => {
    const result = chunkArray([1, 2, 3, 4, 5], 2)
    assert.deepEqual(result, [[1, 2], [3, 4], [5]])
  })

  it('defaults to chunk size 10', () => {
    const arr = Array.from({ length: 25 }, (_, i) => i)
    const result = chunkArray(arr)
    assert.equal(result.length, 3)
    assert.equal(result[0].length, 10)
    assert.equal(result[2].length, 5)
  })

  it('returns single chunk when array is smaller than chunk size', () => {
    assert.deepEqual(chunkArray([1, 2], 10), [[1, 2]])
  })

  it('returns empty array for empty input', () => {
    assert.deepEqual(chunkArray([]), [])
  })
})

describe('timeFormat', () => {
  it('formats milliseconds', () => {
    assert.equal(timeFormat(500), '500 ms')
  })

  it('formats seconds', () => {
    assert.equal(timeFormat(2500), '2.50 secs')
  })

  it('formats minutes', () => {
    assert.equal(timeFormat(90000), '1.50 mins')
  })

  it('formats hours', () => {
    assert.equal(timeFormat(7200000), '2.00 hrs')
  })
})

describe('timeSinceString', () => {
  it('returns a non-empty string for a past timestamp', () => {
    const past = Date.now() - 5000
    const result = timeSinceString(past)
    assert.ok(result.includes('secs') || result.includes('ms'))
  })
})

describe('generateRandomString', () => {
  it('returns a string of the requested length', () => {
    assert.equal(generateRandomString(8).length, 8)
    assert.equal(generateRandomString(4).length, 4)
  })

  it('returns different values on consecutive calls', () => {
    const a = generateRandomString(10)
    const b = generateRandomString(10)
    assert.notEqual(a, b)
  })
})

describe('settledSeparator', () => {
  it('splits fulfilled and rejected results', () => {
    const results: PromiseSettledResult<number>[] = [
      { status: 'fulfilled', value: 1 },
      { status: 'rejected', reason: 'err' },
      { status: 'fulfilled', value: 2 },
    ]
    const { settled, rejected, total } = settledSeparator(results)
    assert.equal(settled.length, 2)
    assert.equal(rejected.length, 1)
    assert.equal(total, 3)
  })

  it('handles all fulfilled', () => {
    const results: PromiseSettledResult<number>[] = [
      { status: 'fulfilled', value: 1 },
    ]
    const { settled, rejected } = settledSeparator(results)
    assert.equal(settled.length, 1)
    assert.equal(rejected.length, 0)
  })
})
