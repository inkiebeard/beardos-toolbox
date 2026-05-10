import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  createTileMap,
  getTileIndex,
  getTileInfo,
  indexToCoords,
  setFlag,
  clearFlag,
  toggleFlag,
  hasFlag,
  addEntity,
  removeEntity,
  moveEntity,
  getEntitiesAt,
  clearEntitiesAt,
  getAdjacentIndices,
  getAdjacentTiles,
  getIndicesInRange,
  getTilesInRange,
  getEntitiesInRange,
  validateTile,
  validateRange,
  createSpatialConfig,
  worldToTile,
  tileToWorld,
  tileCenterWorld,
  screenToWorld,
  worldToScreen,
  screenToTile,
  tileToScreen,
  worldToTileExact,
  getTileAtWorld,
  getTileAtScreen,
  TileFlags,
} from './index'

type Unit = { id: string; hp: number }

describe('createTileMap', () => {
  it('sets correct dimensions and size', () => {
    const map = createTileMap(10, 5)
    assert.equal(map.width, 10)
    assert.equal(map.height, 5)
    assert.equal(map.size, 50)
  })

  it('initialises all flags to 0', () => {
    const map = createTileMap(4, 4)
    assert.ok(map.flags.every(f => f === 0))
  })

  it('starts with no entities', () => {
    const map = createTileMap(4, 4)
    assert.equal(map.entities.size, 0)
  })
})

describe('getTileIndex / indexToCoords', () => {
  const map = createTileMap(10, 10)

  it('returns correct flat index', () => {
    assert.equal(getTileIndex(map, 0, 0), 0)
    assert.equal(getTileIndex(map, 3, 2), 23)
    assert.equal(getTileIndex(map, 9, 9), 99)
  })

  it('returns -1 for out-of-bounds', () => {
    assert.equal(getTileIndex(map, -1, 0), -1)
    assert.equal(getTileIndex(map, 10, 0), -1)
    assert.equal(getTileIndex(map, 0, 10), -1)
  })

  it('round-trips with indexToCoords', () => {
    const coords = { x: 7, y: 4 }
    const index = getTileIndex(map, coords.x, coords.y)
    assert.deepEqual(indexToCoords(map, index), coords)
  })
})

describe('getTileInfo', () => {
  it('returns null for out-of-bounds', () => {
    const map = createTileMap(5, 5)
    assert.equal(getTileInfo(map, 5, 0), null)
  })

  it('returns correct snapshot', () => {
    const map = createTileMap<Unit>(5, 5)
    addEntity(map, 2, 2, { id: 'a', hp: 10 })
    const info = getTileInfo(map, 2, 2)!
    assert.equal(info.x, 2)
    assert.equal(info.y, 2)
    assert.equal(info.entities.length, 1)
    assert.equal(info.entities[0].id, 'a')
  })
})

describe('flags', () => {
  it('setFlag / hasFlag', () => {
    const map = createTileMap(5, 5)
    setFlag(map, 1, 1, TileFlags.BLOCKED)
    assert.ok(hasFlag(map, 1, 1, TileFlags.BLOCKED))
    assert.ok(!hasFlag(map, 1, 1, TileFlags.WATER))
  })

  it('clearFlag removes only the target bit', () => {
    const map = createTileMap(5, 5)
    setFlag(map, 0, 0, TileFlags.BLOCKED | TileFlags.WATER)
    clearFlag(map, 0, 0, TileFlags.BLOCKED)
    assert.ok(!hasFlag(map, 0, 0, TileFlags.BLOCKED))
    assert.ok(hasFlag(map, 0, 0, TileFlags.WATER))
  })

  it('toggleFlag flips bit', () => {
    const map = createTileMap(5, 5)
    toggleFlag(map, 2, 2, TileFlags.VISIBLE)
    assert.ok(hasFlag(map, 2, 2, TileFlags.VISIBLE))
    toggleFlag(map, 2, 2, TileFlags.VISIBLE)
    assert.ok(!hasFlag(map, 2, 2, TileFlags.VISIBLE))
  })

  it('ignores out-of-bounds silently', () => {
    const map = createTileMap(3, 3)
    assert.doesNotThrow(() => setFlag(map, 99, 99, TileFlags.BLOCKED))
    assert.equal(hasFlag(map, 99, 99, TileFlags.BLOCKED), false)
  })
})

describe('entities', () => {
  it('addEntity / getEntitiesAt', () => {
    const map = createTileMap<Unit>(5, 5)
    addEntity(map, 1, 1, { id: 'hero', hp: 100 })
    const entities = getEntitiesAt(map, 1, 1)
    assert.equal(entities.length, 1)
    assert.equal(entities[0].id, 'hero')
  })

  it('addEntity returns false out-of-bounds', () => {
    const map = createTileMap<Unit>(3, 3)
    assert.equal(addEntity(map, 5, 5, { id: 'x', hp: 1 }), false)
  })

  it('removeEntity removes the first match', () => {
    const map = createTileMap<Unit>(5, 5)
    addEntity(map, 0, 0, { id: 'a', hp: 1 })
    addEntity(map, 0, 0, { id: 'b', hp: 2 })
    const removed = removeEntity(map, 0, 0, e => e.id === 'a')
    assert.ok(removed)
    assert.equal(getEntitiesAt(map, 0, 0).length, 1)
    assert.equal(getEntitiesAt(map, 0, 0)[0].id, 'b')
  })

  it('removeEntity cleans up empty bucket', () => {
    const map = createTileMap<Unit>(5, 5)
    addEntity(map, 0, 0, { id: 'a', hp: 1 })
    removeEntity(map, 0, 0, e => e.id === 'a')
    assert.equal(map.entities.has(getTileIndex(map, 0, 0)), false)
  })

  it('removeEntity returns false when no match', () => {
    const map = createTileMap<Unit>(5, 5)
    addEntity(map, 0, 0, { id: 'a', hp: 1 })
    assert.equal(removeEntity(map, 0, 0, e => e.id === 'z'), false)
  })

  it('moveEntity transfers entity between tiles', () => {
    const map = createTileMap<Unit>(5, 5)
    addEntity(map, 0, 0, { id: 'hero', hp: 50 })
    const moved = moveEntity(map, 0, 0, 1, 0, e => e.id === 'hero')
    assert.ok(moved)
    assert.equal(getEntitiesAt(map, 0, 0).length, 0)
    assert.equal(getEntitiesAt(map, 1, 0)[0].id, 'hero')
  })

  it('clearEntitiesAt removes all entities on tile', () => {
    const map = createTileMap<Unit>(5, 5)
    addEntity(map, 2, 2, { id: 'a', hp: 1 })
    addEntity(map, 2, 2, { id: 'b', hp: 2 })
    clearEntitiesAt(map, 2, 2)
    assert.equal(getEntitiesAt(map, 2, 2).length, 0)
  })
})

describe('adjacency', () => {
  const map = createTileMap(5, 5)

  it('returns 4 cardinal neighbours for a centre tile', () => {
    const adj = getAdjacentIndices(map, 2, 2)
    assert.equal(adj.length, 4)
  })

  it('returns 8 neighbours with diagonals for a centre tile', () => {
    const adj = getAdjacentIndices(map, 2, 2, true)
    assert.equal(adj.length, 8)
  })

  it('clips neighbours at map edges', () => {
    const adj = getAdjacentIndices(map, 0, 0, true)
    assert.equal(adj.length, 3)
  })

  it('getAdjacentTiles includes correct coords', () => {
    const tiles = getAdjacentTiles(map, 2, 2)
    const coords = tiles.map(t => `${t.x},${t.y}`).sort()
    assert.deepEqual(coords, ['1,2', '2,1', '2,3', '3,2'])
  })
})

describe('range queries', () => {
  const map = createTileMap<Unit>(9, 9)

  it('getIndicesInRange square excludes origin by default', () => {
    const indices = getIndicesInRange(map, 4, 4, 1)
    assert.equal(indices.length, 8)
    assert.ok(!indices.includes(getTileIndex(map, 4, 4)))
  })

  it('getIndicesInRange square includes origin when requested', () => {
    const indices = getIndicesInRange(map, 4, 4, 1, 'square', true)
    assert.equal(indices.length, 9)
  })

  it('getIndicesInRange circle is smaller than square', () => {
    const square = getIndicesInRange(map, 4, 4, 3, 'square')
    const circle = getIndicesInRange(map, 4, 4, 3, 'circle')
    assert.ok(circle.length < square.length)
  })

  it('getEntitiesInRange collects from all tiles in range', () => {
    const m = createTileMap<Unit>(9, 9)
    addEntity(m, 3, 4, { id: 'a', hp: 1 })
    addEntity(m, 5, 4, { id: 'b', hp: 1 })
    addEntity(m, 4, 4, { id: 'origin', hp: 1 }) // excluded
    const entities = getEntitiesInRange(m, 4, 4, 2)
    const ids = entities.map(e => e.id).sort()
    assert.ok(ids.includes('a'))
    assert.ok(ids.includes('b'))
    assert.ok(!ids.includes('origin'))
  })

  it('getTilesInRange returns TileInfo with correct coords', () => {
    const tiles = getTilesInRange(map, 4, 4, 1)
    assert.ok(tiles.every(t => typeof t.index === 'number' && typeof t.x === 'number'))
  })
})

describe('validation', () => {
  it('validateTile returns false for out-of-bounds', () => {
    const map = createTileMap(5, 5)
    assert.equal(validateTile(map, 10, 10), false)
  })

  it('validateTile returns true for in-bounds with no validator', () => {
    const map = createTileMap(5, 5)
    assert.equal(validateTile(map, 2, 2), true)
  })

  it('validateTile applies validator', () => {
    const map = createTileMap(5, 5)
    setFlag(map, 1, 1, TileFlags.BLOCKED)
    const passable = (t: { flags: number }) => !(t.flags & TileFlags.BLOCKED)
    assert.equal(validateTile(map, 1, 1, passable), false)
    assert.equal(validateTile(map, 2, 2, passable), true)
  })

  it('validateRange returns false when any tile fails', () => {
    const map = createTileMap(9, 9)
    setFlag(map, 5, 4, TileFlags.BLOCKED)
    const passable = (t: { flags: number }) => !(t.flags & TileFlags.BLOCKED)
    assert.equal(validateRange(map, 4, 4, 2, passable), false)
  })

  it('validateRange returns true when all tiles pass', () => {
    const map = createTileMap(9, 9)
    const passable = (t: { flags: number }) => !(t.flags & TileFlags.BLOCKED)
    assert.equal(validateRange(map, 4, 4, 1, passable), true)
  })
})

describe('spatial config', () => {
  const spatial = createSpatialConfig(32, 32)
  const spatialOffset = createSpatialConfig(32, 32, 64, 64)

  it('worldToTile floors correctly', () => {
    assert.deepEqual(worldToTile(spatial, 0, 0), { x: 0, y: 0 })
    assert.deepEqual(worldToTile(spatial, 63, 63), { x: 1, y: 1 })
    assert.deepEqual(worldToTile(spatial, 64, 64), { x: 2, y: 2 })
  })

  it('worldToTile respects origin offset', () => {
    assert.deepEqual(worldToTile(spatialOffset, 64, 64), { x: 0, y: 0 })
    assert.deepEqual(worldToTile(spatialOffset, 96, 96), { x: 1, y: 1 })
  })

  it('tileToWorld returns top-left corner', () => {
    assert.deepEqual(tileToWorld(spatial, 2, 3), { x: 64, y: 96 })
    assert.deepEqual(tileToWorld(spatialOffset, 0, 0), { x: 64, y: 64 })
  })

  it('tileCenterWorld returns tile centre', () => {
    assert.deepEqual(tileCenterWorld(spatial, 0, 0), { x: 16, y: 16 })
    assert.deepEqual(tileCenterWorld(spatial, 1, 1), { x: 48, y: 48 })
  })

  it('worldToTile / tileToWorld round-trip', () => {
    const tx = 5; const ty = 3
    const world = tileToWorld(spatial, tx, ty)
    const back = worldToTile(spatial, world.x, world.y)
    assert.deepEqual(back, { x: tx, y: ty })
  })

  it('screenToWorld / worldToScreen are inverse', () => {
    const cX = 128; const cY = 64
    const world = screenToWorld(cX, cY, 100, 50)
    assert.deepEqual(world, { x: 228, y: 114 })
    assert.deepEqual(worldToScreen(cX, cY, world.x, world.y), { x: 100, y: 50 })
  })

  it('screenToTile maps click to grid cell', () => {
    const tile = screenToTile(spatial, 0, 0, 65, 33)
    assert.deepEqual(tile, { x: 2, y: 1 })
  })

  it('tileToScreen is inverse of screenToTile at origin', () => {
    const screen = tileToScreen(spatial, 0, 0, 2, 1)
    assert.deepEqual(screen, { x: 64, y: 32 })
  })

  it('worldToTileExact returns correct fractions', () => {
    const pos = worldToTileExact(spatial, 48, 16)
    assert.equal(pos.tileX, 1)
    assert.equal(pos.tileY, 0)
    assert.ok(Math.abs(pos.fracX - 0.5) < 1e-9)
    assert.ok(Math.abs(pos.fracY - 0.5) < 1e-9)
  })

  it('getTileAtWorld returns correct tile', () => {
    const map = createTileMap<Unit>(10, 10)
    setFlag(map, 2, 3, TileFlags.WATER)
    const tile = getTileAtWorld(map, spatial, 64, 96)
    assert.ok(tile !== null)
    assert.equal(tile!.x, 2)
    assert.equal(tile!.y, 3)
    assert.ok(tile!.flags & TileFlags.WATER)
  })

  it('getTileAtScreen accounts for camera offset', () => {
    const map = createTileMap<Unit>(10, 10)
    const tile = getTileAtScreen(map, spatial, 32, 32, 32, 32)
    assert.ok(tile !== null)
    assert.equal(tile!.x, 2)
    assert.equal(tile!.y, 2)
  })

  it('getTileAtWorld returns null out-of-bounds', () => {
    const map = createTileMap(5, 5)
    assert.equal(getTileAtWorld(map, spatial, 9999, 9999), null)
  })
})
