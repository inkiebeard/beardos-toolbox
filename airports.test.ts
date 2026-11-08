import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { INTERNATIONAL_AIRPORTS, findNearestAirports, haversineKm } from './airports'

describe('INTERNATIONAL_AIRPORTS', () => {
  it('has unique 3-letter IATA codes', () => {
    const codes = INTERNATIONAL_AIRPORTS.map(a => a.code)
    assert.ok(codes.every(c => /^[A-Z]{3}$/.test(c)))
    assert.equal(new Set(codes).size, codes.length)
  })

  it('has valid coordinates', () => {
    for (const a of INTERNATIONAL_AIRPORTS) {
      assert.ok(a.lat >= -90 && a.lat <= 90, a.code)
      assert.ok(a.lon >= -180 && a.lon <= 180, a.code)
      assert.ok(a.name.length > 0, a.code)
    }
  })
})

describe('haversineKm', () => {
  it('is zero for identical points', () => {
    assert.equal(haversineKm(10, 20, 10, 20), 0)
  })
  it('matches a known distance (London-New York ~5570km)', () => {
    const d = haversineKm(51.47, -0.4543, 40.6413, -73.7781)
    assert.ok(Math.abs(d - 5540) < 60, `got ${d}`)
  })
  it('handles antipodes without NaN', () => {
    const d = haversineKm(0, 0, 0, 180)
    assert.ok(Math.abs(d - 20015) < 5, `got ${d}`)
  })
})

describe('findNearestAirports', () => {
  it('returns 3 by default, nearest first', () => {
    const r = findNearestAirports(-33.86, 151.21)
    assert.equal(r.length, 3)
    assert.equal(r[0].code, 'SYD')
    assert.ok(r[0].distanceKm < r[1].distanceKm && r[1].distanceKm <= r[2].distanceKm)
  })

  it('respects limit', () => {
    assert.equal(findNearestAirports(48.1, 11.5, { limit: 5 }).length, 5)
    assert.deepEqual(findNearestAirports(48.1, 11.5, { limit: 1 }).map(a => a.code), ['MUC'])
  })

  it('applies maxDistanceKm and can return fewer than limit', () => {
    const r = findNearestAirports(-33.86, 151.21, { maxDistanceKm: 100 })
    assert.deepEqual(r.map(a => a.code), ['SYD'])
  })

  it('returns [] in the middle of nowhere with a threshold', () => {
    assert.deepEqual(findNearestAirports(-48.9, -123.4, { maxDistanceKm: 500 }), []) // Point Nemo
  })

  it('still finds airports far from anything when unthresholded', () => {
    const r = findNearestAirports(-48.9, -123.4)
    assert.equal(r.length, 3)
    assert.ok(r[0].distanceKm > 3000)
  })

  it('wraps correctly across the antimeridian', () => {
    // Just west of 180 -> Fiji/Samoa area, not a trans-planet airport
    const r = findNearestAirports(-17.7, -179.9, { limit: 1 })
    assert.equal(r[0].code, 'NAN')
    assert.ok(r[0].distanceKm < 400)
  })

  it('works at the poles', () => {
    assert.equal(findNearestAirports(90, 0).length, 3)
    assert.equal(findNearestAirports(-90, 0).length, 3)
  })

  it('accepts a custom dataset', () => {
    const custom = [{ name: 'X', code: 'XXX', lat: 0, lon: 0 }]
    assert.equal(findNearestAirports(1, 1, {}, custom)[0].code, 'XXX')
  })

  it('rejects invalid input', () => {
    assert.throws(() => findNearestAirports(91, 0), RangeError)
    assert.throws(() => findNearestAirports(0, 181), RangeError)
    assert.throws(() => findNearestAirports(NaN, 0), RangeError)
    assert.throws(() => findNearestAirports(0, 0, { limit: 0 }), RangeError)
    assert.throws(() => findNearestAirports(0, 0, { limit: 1.5 }), RangeError)
    assert.throws(() => findNearestAirports(0, 0, { maxDistanceKm: -1 }), RangeError)
  })
})
