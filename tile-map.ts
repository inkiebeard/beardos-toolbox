// --- types ---

/** A 2-D grid of tiles. `T` is the entity type stored per tile. */
export type TileMap<T = unknown> = {
  readonly width: number
  readonly height: number
  readonly size: number
  flags: Uint8Array
  entities: Map<number, T[]>
}

/**
 * A snapshot of a single tile's state.
 * `index` is the flat array position (`y * width + x`).
 */
export type TileInfo<T> = {
  readonly index: number
  readonly x: number
  readonly y: number
  flags: number
  entities: T[]
}

/** Shape used when collecting tiles or entities within a radius. */
export type RangeShape = 'square' | 'circle'

/** Return `true` to pass, `false` to fail. Used by `validateTile` and `validateRange`. */
export type TileValidator<T> = (tile: TileInfo<T>) => boolean

/**
 * Predefined single-bit flag constants.
 * Combine multiple flags with the bitwise OR operator:
 * ```ts
 * setFlag(map, x, y, TileFlags.BLOCKED | TileFlags.HAZARD)
 * ```
 * You can define additional custom flags as any unused power-of-two number
 * up to `0b10000000` (Uint8 supports 8 independent bits total).
 */
export const TileFlags = {
  NONE:       0b00000000,
  BLOCKED:    0b00000001,
  OCCUPIED:   0b00000010,
  VISIBLE:    0b00000100,
  EXPLORED:   0b00001000,
  WATER:      0b00010000,
  HAZARD:     0b00100000,
} as const

// --- internal helpers ---

const _idx = (width: number, x: number, y: number): number => y * width + x

const _inBounds = (width: number, height: number, x: number, y: number): boolean =>
  x >= 0 && x < width && y >= 0 && y < height

// Packed dx/dy pairs for cardinal then diagonal neighbours
const _CARDINAL = new Int8Array([-1, 0, 1, 0, 0, -1, 0, 1])
const _ALL_ADJ  = new Int8Array([-1, 0, 1, 0, 0, -1, 0, 1, -1, -1, -1, 1, 1, -1, 1, 1])

// --- creation ---

/**
 * Create a new tile map of the given dimensions.
 * All flags start at 0 and no entities are placed.
 * @param width  Number of columns.
 * @param height Number of rows.
 * @returns A fresh `TileMap<T>`.
 * @example
 * type Unit = { id: string }
 * const map = createTileMap<Unit>(64, 64)
 */
export const createTileMap = <T>(width: number, height: number): TileMap<T> => ({
  width,
  height,
  size: width * height,
  flags: new Uint8Array(width * height),
  entities: new Map(),
})

// --- tile access ---

/**
 * Convert grid coordinates to a flat array index.
 * Returns `-1` when the coordinates are out of bounds.
 * @param map The tile map.
 * @param x   Column.
 * @param y   Row.
 */
export const getTileIndex = (map: TileMap<unknown>, x: number, y: number): number =>
  _inBounds(map.width, map.height, x, y) ? _idx(map.width, x, y) : -1

/**
 * Return a `TileInfo` snapshot for the tile at `(x, y)`.
 * Returns `null` when the coordinates are out of bounds.
 * @param map The tile map.
 * @param x   Column.
 * @param y   Row.
 */
export const getTileInfo = <T>(map: TileMap<T>, x: number, y: number): TileInfo<T> | null => {
  if (!_inBounds(map.width, map.height, x, y)) return null
  const index = _idx(map.width, x, y)
  return {
    index,
    x,
    y,
    flags: map.flags[index],
    entities: map.entities.get(index) ?? [],
  }
}

/**
 * Convert a flat array index back to `{ x, y }` grid coordinates.
 * @param map   The tile map (used for its `width`).
 * @param index Flat tile index.
 */
export const indexToCoords = (map: TileMap<unknown>, index: number): { x: number; y: number } => ({
  x: index % map.width,
  y: (index / map.width) | 0,
})

// --- flag operations (bitwise, Uint8 supports 8 independent flags) ---

/**
 * Set one or more flags on a tile using bitwise OR.
 * Out-of-bounds coordinates are silently ignored.
 * @param map  The tile map.
 * @param x    Column.
 * @param y    Row.
 * @param flag Flag bit(s) from `TileFlags` or a custom power-of-two constant.
 * @example
 * setFlag(map, 3, 5, TileFlags.BLOCKED)
 */
export const setFlag = (map: TileMap<unknown>, x: number, y: number, flag: number): void => {
  if (_inBounds(map.width, map.height, x, y)) map.flags[_idx(map.width, x, y)] |= flag
}

/**
 * Clear one or more flags on a tile using bitwise AND NOT.
 * Out-of-bounds coordinates are silently ignored.
 * @param map  The tile map.
 * @param x    Column.
 * @param y    Row.
 * @param flag Flag bit(s) to clear.
 */
export const clearFlag = (map: TileMap<unknown>, x: number, y: number, flag: number): void => {
  if (_inBounds(map.width, map.height, x, y)) map.flags[_idx(map.width, x, y)] &= ~flag
}

/**
 * Toggle one or more flags on a tile using bitwise XOR.
 * Out-of-bounds coordinates are silently ignored.
 * @param map  The tile map.
 * @param x    Column.
 * @param y    Row.
 * @param flag Flag bit(s) to toggle.
 */
export const toggleFlag = (map: TileMap<unknown>, x: number, y: number, flag: number): void => {
  if (_inBounds(map.width, map.height, x, y)) map.flags[_idx(map.width, x, y)] ^= flag
}

/**
 * Return `true` if **all** supplied flag bits are set on the tile.
 * Returns `false` for out-of-bounds coordinates.
 * @param map  The tile map.
 * @param x    Column.
 * @param y    Row.
 * @param flag Flag bit(s) to test.
 * @example
 * if (hasFlag(map, x, y, TileFlags.BLOCKED)) { ... }
 */
export const hasFlag = (map: TileMap<unknown>, x: number, y: number, flag: number): boolean => {
  if (!_inBounds(map.width, map.height, x, y)) return false
  return (map.flags[_idx(map.width, x, y)] & flag) !== 0
}

// --- entity operations ---

/**
 * Add an entity to the tile at `(x, y)`.
 * Returns `false` when the coordinates are out of bounds (entity is not added).
 * @param map    The tile map.
 * @param x      Column.
 * @param y      Row.
 * @param entity The entity to place on the tile.
 */
export const addEntity = <T>(map: TileMap<T>, x: number, y: number, entity: T): boolean => {
  if (!_inBounds(map.width, map.height, x, y)) return false
  const index = _idx(map.width, x, y)
  const bucket = map.entities.get(index)
  if (bucket) bucket.push(entity)
  else map.entities.set(index, [entity])
  return true
}

/**
 * Remove the **first** entity on the tile at `(x, y)` for which `predicate` returns `true`.
 * Returns `false` when out of bounds or no matching entity is found.
 * @param map       The tile map.
 * @param x         Column.
 * @param y         Row.
 * @param predicate Selector — return `true` for the entity to remove.
 * @example
 * removeEntity(map, x, y, e => e.id === 'hero')
 */
export const removeEntity = <T>(
  map: TileMap<T>,
  x: number,
  y: number,
  predicate: (e: T) => boolean
): boolean => {
  if (!_inBounds(map.width, map.height, x, y)) return false
  const index = _idx(map.width, x, y)
  const bucket = map.entities.get(index)
  if (!bucket) return false
  for (let i = 0; i < bucket.length; i++) {
    if (predicate(bucket[i])) {
      bucket.splice(i, 1)
      if (bucket.length === 0) map.entities.delete(index)
      return true
    }
  }
  return false
}

/**
 * Atomically move the **first** matching entity from one tile to another.
 * Returns `false` when either coordinate is out of bounds or no matching entity is found.
 * @param map       The tile map.
 * @param fromX     Source column.
 * @param fromY     Source row.
 * @param toX       Destination column.
 * @param toY       Destination row.
 * @param predicate Selector — return `true` for the entity to move.
 * @example
 * moveEntity(map, 2, 3, 2, 4, e => e.id === 'hero')
 */
export const moveEntity = <T>(
  map: TileMap<T>,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  predicate: (e: T) => boolean
): boolean => {
  const { width, height } = map
  if (!_inBounds(width, height, fromX, fromY) || !_inBounds(width, height, toX, toY)) return false
  const srcIndex = _idx(width, fromX, fromY)
  const src = map.entities.get(srcIndex)
  if (!src) return false
  for (let i = 0; i < src.length; i++) {
    if (predicate(src[i])) {
      const entity = src[i]
      src.splice(i, 1)
      if (src.length === 0) map.entities.delete(srcIndex)
      const dstIndex = _idx(width, toX, toY)
      const dst = map.entities.get(dstIndex)
      if (dst) dst.push(entity)
      else map.entities.set(dstIndex, [entity])
      return true
    }
  }
  return false
}

/**
 * Return all entities on the tile at `(x, y)`.
 * Returns an empty array for out-of-bounds coordinates or tiles with no entities.
 * @param map The tile map.
 * @param x   Column.
 * @param y   Row.
 */
export const getEntitiesAt = <T>(map: TileMap<T>, x: number, y: number): T[] => {
  if (!_inBounds(map.width, map.height, x, y)) return []
  return map.entities.get(_idx(map.width, x, y)) ?? []
}

/**
 * Remove all entities from the tile at `(x, y)`.
 * Out-of-bounds coordinates are silently ignored.
 * @param map The tile map.
 * @param x   Column.
 * @param y   Row.
 */
export const clearEntitiesAt = <T>(map: TileMap<T>, x: number, y: number): void => {
  if (_inBounds(map.width, map.height, x, y)) map.entities.delete(_idx(map.width, x, y))
}

// --- adjacency ---

/**
 * Return the flat indices of tiles adjacent to `(x, y)`.
 * Only in-bounds neighbours are included.
 * @param map              The tile map.
 * @param x                Column.
 * @param y                Row.
 * @param includeDiagonals When `true`, returns up to 8 neighbours; otherwise up to 4 (cardinal only).
 */
export const getAdjacentIndices = (
  map: TileMap<unknown>,
  x: number,
  y: number,
  includeDiagonals = false
): number[] => {
  const { width, height } = map
  const offsets = includeDiagonals ? _ALL_ADJ : _CARDINAL
  const result: number[] = []
  for (let i = 0; i < offsets.length; i += 2) {
    const nx = x + offsets[i]
    const ny = y + offsets[i + 1]
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) result.push(_idx(width, nx, ny))
  }
  return result
}

/**
 * Return full `TileInfo` snapshots for all tiles adjacent to `(x, y)`.
 * Only in-bounds neighbours are included.
 * @param map              The tile map.
 * @param x                Column.
 * @param y                Row.
 * @param includeDiagonals When `true`, returns up to 8 neighbours; otherwise up to 4 (cardinal only).
 */
export const getAdjacentTiles = <T>(
  map: TileMap<T>,
  x: number,
  y: number,
  includeDiagonals = false
): TileInfo<T>[] => {
  const { width, height } = map
  const offsets = includeDiagonals ? _ALL_ADJ : _CARDINAL
  const result: TileInfo<T>[] = []
  for (let i = 0; i < offsets.length; i += 2) {
    const nx = x + offsets[i]
    const ny = y + offsets[i + 1]
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const index = _idx(width, nx, ny)
      result.push({ index, x: nx, y: ny, flags: map.flags[index], entities: map.entities.get(index) ?? [] })
    }
  }
  return result
}

// --- range queries ---

/**
 * Return the flat indices of all tiles within `range` of `(x, y)`.
 * The origin tile is excluded unless `includeOrigin` is `true`.
 * Circle shape uses integer `dx² + dy² ≤ range²` — no `Math.sqrt`.
 * @param map           The tile map.
 * @param x             Center column.
 * @param y             Center row.
 * @param range         Radius in tiles.
 * @param shape         `'square'` (default) or `'circle'`.
 * @param includeOrigin Include the center tile itself (default `false`).
 */
export const getIndicesInRange = (
  map: TileMap<unknown>,
  x: number,
  y: number,
  range: number,
  shape: RangeShape = 'square',
  includeOrigin = false
): number[] => {
  const { width, height } = map
  const r2 = range * range
  const result: number[] = []
  for (let dy = -range; dy <= range; dy++) {
    const ny = y + dy
    if (ny < 0 || ny >= height) continue
    for (let dx = -range; dx <= range; dx++) {
      if (!includeOrigin && dx === 0 && dy === 0) continue
      if (shape === 'circle' && dx * dx + dy * dy > r2) continue
      const nx = x + dx
      if (nx >= 0 && nx < width) result.push(_idx(width, nx, ny))
    }
  }
  return result
}

/**
 * Return full `TileInfo` snapshots for all tiles within `range` of `(x, y)`.
 * The origin tile is excluded unless `includeOrigin` is `true`.
 * @param map           The tile map.
 * @param x             Center column.
 * @param y             Center row.
 * @param range         Radius in tiles.
 * @param shape         `'square'` (default) or `'circle'`.
 * @param includeOrigin Include the center tile itself (default `false`).
 */
export const getTilesInRange = <T>(
  map: TileMap<T>,
  x: number,
  y: number,
  range: number,
  shape: RangeShape = 'square',
  includeOrigin = false
): TileInfo<T>[] => {
  const { width, height } = map
  const r2 = range * range
  const result: TileInfo<T>[] = []
  for (let dy = -range; dy <= range; dy++) {
    const ny = y + dy
    if (ny < 0 || ny >= height) continue
    for (let dx = -range; dx <= range; dx++) {
      if (!includeOrigin && dx === 0 && dy === 0) continue
      if (shape === 'circle' && dx * dx + dy * dy > r2) continue
      const nx = x + dx
      if (nx >= 0 && nx < width) {
        const index = _idx(width, nx, ny)
        result.push({ index, x: nx, y: ny, flags: map.flags[index], entities: map.entities.get(index) ?? [] })
      }
    }
  }
  return result
}

/**
 * Collect and return every entity on every tile within `range` of `(x, y)`.
 * The origin tile is excluded unless `includeOrigin` is `true`.
 * Tiles with no entities contribute nothing to the result.
 * @param map           The tile map.
 * @param x             Center column.
 * @param y             Center row.
 * @param range         Radius in tiles.
 * @param shape         `'square'` (default) or `'circle'`.
 * @param includeOrigin Include entities on the center tile itself (default `false`).
 * @example
 * const enemies = getEntitiesInRange(map, heroX, heroY, 3, 'circle')
 */
export const getEntitiesInRange = <T>(
  map: TileMap<T>,
  x: number,
  y: number,
  range: number,
  shape: RangeShape = 'square',
  includeOrigin = false
): T[] => {
  const { width, height } = map
  const r2 = range * range
  const result: T[] = []
  for (let dy = -range; dy <= range; dy++) {
    const ny = y + dy
    if (ny < 0 || ny >= height) continue
    for (let dx = -range; dx <= range; dx++) {
      if (!includeOrigin && dx === 0 && dy === 0) continue
      if (shape === 'circle' && dx * dx + dy * dy > r2) continue
      const nx = x + dx
      if (nx < 0 || nx >= width) continue
      const bucket = map.entities.get(_idx(width, nx, ny))
      if (bucket) for (let i = 0; i < bucket.length; i++) result.push(bucket[i])
    }
  }
  return result
}

// --- validation ---

/**
 * Test whether the tile at `(x, y)` is in bounds and passes an optional validator.
 * When no `validator` is provided, returns `true` for any in-bounds coordinate.
 * @param map       The tile map.
 * @param x         Column.
 * @param y         Row.
 * @param validator Optional predicate; receives a `TileInfo` snapshot.
 * @example
 * const passable = validateTile(map, x, y, t => !(t.flags & TileFlags.BLOCKED))
 */
export const validateTile = <T>(
  map: TileMap<T>,
  x: number,
  y: number,
  validator?: TileValidator<T>
): boolean => {
  if (!_inBounds(map.width, map.height, x, y)) return false
  if (!validator) return true
  const index = _idx(map.width, x, y)
  return validator({ index, x, y, flags: map.flags[index], entities: map.entities.get(index) ?? [] })
}

/**
 * Test whether **every** tile within `range` of `(x, y)` passes `validator`.
 * Short-circuits on the first failing tile. Out-of-bounds tiles are skipped entirely.
 * The origin tile is excluded unless `includeOrigin` is `true`.
 * @param map           The tile map.
 * @param x             Center column.
 * @param y             Center row.
 * @param range         Radius in tiles.
 * @param validator     Predicate; receives a `TileInfo` snapshot.
 * @param shape         `'square'` (default) or `'circle'`.
 * @param includeOrigin Include the center tile in validation (default `false`).
 * @example
 * const areaClear = validateRange(map, x, y, 2, t => t.entities.length === 0)
 */
export const validateRange = <T>(
  map: TileMap<T>,
  x: number,
  y: number,
  range: number,
  validator: TileValidator<T>,
  shape: RangeShape = 'square',
  includeOrigin = false
): boolean => {
  const { width, height } = map
  const r2 = range * range
  for (let dy = -range; dy <= range; dy++) {
    const ny = y + dy
    if (ny < 0 || ny >= height) continue
    for (let dx = -range; dx <= range; dx++) {
      if (!includeOrigin && dx === 0 && dy === 0) continue
      if (shape === 'circle' && dx * dx + dy * dy > r2) continue
      const nx = x + dx
      if (nx < 0 || nx >= width) continue
      const index = _idx(width, nx, ny)
      if (!validator({ index, x: nx, y: ny, flags: map.flags[index], entities: map.entities.get(index) ?? [] })) return false
    }
  }
  return true
}

// --- spatial / screen-space ---

/**
 * Pixel dimensions of a single tile and an optional world-space origin offset.
 * Create once and reuse; it never mutates.
 *
 * - `tileWidth` / `tileHeight`: pixels per tile (e.g. 32 for a 32×32 sprite sheet).
 * - `originX` / `originY`: world-pixel offset of tile (0, 0)'s top-left corner.
 *   Use this to add margins or align the grid inside a larger world.
 *
 * Non-square tiles (e.g. 64×32 isometric projections) are fully supported.
 */
export type SpatialConfig = {
  readonly tileWidth: number
  readonly tileHeight: number
  readonly originX: number
  readonly originY: number
}

/**
 * Fractional tile-grid position for an entity at an arbitrary world coordinate.
 * `tileX` / `tileY` are the integer grid cell; `fracX` / `fracY` are 0..1 offsets
 * within that cell — useful for smooth movement interpolation and collision checks.
 */
export type TilePosition = {
  tileX: number
  tileY: number
  fracX: number
  fracY: number
}

/**
 * Create a `SpatialConfig`.
 * @param tileWidth  Pixels per tile column.
 * @param tileHeight Pixels per tile row.
 * @param originX    World-pixel X of the grid's top-left corner (default `0`).
 * @param originY    World-pixel Y of the grid's top-left corner (default `0`).
 * @example
 * const spatial = createSpatialConfig(32, 32)
 * const spatial = createSpatialConfig(64, 32, 128, 64) // offset grid
 */
export const createSpatialConfig = (
  tileWidth: number,
  tileHeight: number,
  originX = 0,
  originY = 0
): SpatialConfig => ({ tileWidth, tileHeight, originX, originY })

/**
 * Convert world-pixel coordinates to integer tile grid coordinates.
 * Fractions are floored, so the result is always the tile the point falls inside.
 * Returns `{ x: -1, y: -1 }` when the world position is before the grid origin.
 * @param spatial World-to-grid mapping config.
 * @param wx      World X in pixels.
 * @param wy      World Y in pixels.
 */
export const worldToTile = (
  spatial: SpatialConfig,
  wx: number,
  wy: number
): { x: number; y: number } => ({
  x: ((wx - spatial.originX) / spatial.tileWidth)  | 0,
  y: ((wy - spatial.originY) / spatial.tileHeight) | 0,
})

/**
 * Convert tile grid coordinates to the world-pixel position of the tile's **top-left corner**.
 * @param spatial World-to-grid mapping config.
 * @param tx      Tile column.
 * @param ty      Tile row.
 */
export const tileToWorld = (
  spatial: SpatialConfig,
  tx: number,
  ty: number
): { x: number; y: number } => ({
  x: tx * spatial.tileWidth  + spatial.originX,
  y: ty * spatial.tileHeight + spatial.originY,
})

/**
 * Convert tile grid coordinates to the world-pixel position of the tile's **center**.
 * Useful for placing sprites, projectile origins, or distance calculations.
 * @param spatial World-to-grid mapping config.
 * @param tx      Tile column.
 * @param ty      Tile row.
 */
export const tileCenterWorld = (
  spatial: SpatialConfig,
  tx: number,
  ty: number
): { x: number; y: number } => ({
  x: tx * spatial.tileWidth  + spatial.originX + (spatial.tileWidth  >> 1),
  y: ty * spatial.tileHeight + spatial.originY + (spatial.tileHeight >> 1),
})

/**
 * Convert screen-pixel coordinates to world-pixel coordinates using the camera offset.
 * The camera position is the world-space coordinate of the screen's top-left corner.
 * @param cameraX Camera world X (scroll offset).
 * @param cameraY Camera world Y (scroll offset).
 * @param sx      Screen X in pixels.
 * @param sy      Screen Y in pixels.
 */
export const screenToWorld = (
  cameraX: number,
  cameraY: number,
  sx: number,
  sy: number
): { x: number; y: number } => ({
  x: sx + cameraX,
  y: sy + cameraY,
})

/**
 * Convert world-pixel coordinates to screen-pixel coordinates using the camera offset.
 * @param cameraX Camera world X (scroll offset).
 * @param cameraY Camera world Y (scroll offset).
 * @param wx      World X in pixels.
 * @param wy      World Y in pixels.
 */
export const worldToScreen = (
  cameraX: number,
  cameraY: number,
  wx: number,
  wy: number
): { x: number; y: number } => ({
  x: wx - cameraX,
  y: wy - cameraY,
})

/**
 * Convert screen-pixel coordinates directly to tile grid coordinates,
 * accounting for both the camera offset and the grid origin.
 * @param spatial World-to-grid mapping config.
 * @param cameraX Camera world X (scroll offset).
 * @param cameraY Camera world Y (scroll offset).
 * @param sx      Screen X in pixels.
 * @param sy      Screen Y in pixels.
 */
export const screenToTile = (
  spatial: SpatialConfig,
  cameraX: number,
  cameraY: number,
  sx: number,
  sy: number
): { x: number; y: number } => ({
  x: ((sx + cameraX - spatial.originX) / spatial.tileWidth)  | 0,
  y: ((sy + cameraY - spatial.originY) / spatial.tileHeight) | 0,
})

/**
 * Convert tile grid coordinates to screen-pixel coordinates (top-left of the tile),
 * accounting for the camera offset and grid origin.
 * @param spatial World-to-grid mapping config.
 * @param cameraX Camera world X (scroll offset).
 * @param cameraY Camera world Y (scroll offset).
 * @param tx      Tile column.
 * @param ty      Tile row.
 */
export const tileToScreen = (
  spatial: SpatialConfig,
  cameraX: number,
  cameraY: number,
  tx: number,
  ty: number
): { x: number; y: number } => ({
  x: tx * spatial.tileWidth  + spatial.originX - cameraX,
  y: ty * spatial.tileHeight + spatial.originY - cameraY,
})

/**
 * Return the exact fractional tile-grid position for a world coordinate.
 * `tileX` / `tileY` are the integer grid cell the point is inside.
 * `fracX` / `fracY` are 0..1 fractions representing how far into the tile the point is —
 * essential for smooth cross-tile movement, linear interpolation animations, and sub-tile collision.
 * @param spatial World-to-grid mapping config.
 * @param wx      World X in pixels.
 * @param wy      World Y in pixels.
 * @example
 * // Entity smoothly walking; determine which tile it's in and how far across
 * const pos = worldToTileExact(spatial, entity.x, entity.y)
 * // pos.fracX === 0.5 means entity is horizontally centred in its tile
 */
export const worldToTileExact = (
  spatial: SpatialConfig,
  wx: number,
  wy: number
): TilePosition => {
  const fx = (wx - spatial.originX) / spatial.tileWidth
  const fy = (wy - spatial.originY) / spatial.tileHeight
  const tileX = fx | 0
  const tileY = fy | 0
  return { tileX, tileY, fracX: fx - tileX, fracY: fy - tileY }
}

/**
 * Convenience: return the `TileInfo` for whatever tile a world-pixel position falls on.
 * Returns `null` when out of bounds.
 * @param map     The tile map.
 * @param spatial World-to-grid mapping config.
 * @param wx      World X in pixels.
 * @param wy      World Y in pixels.
 * @example
 * const tile = getTileAtWorld(map, spatial, entity.x, entity.y)
 * if (tile && tile.flags & TileFlags.HAZARD) takeDamage(entity)
 */
export const getTileAtWorld = <T>(
  map: TileMap<T>,
  spatial: SpatialConfig,
  wx: number,
  wy: number
): TileInfo<T> | null => {
  const tx = ((wx - spatial.originX) / spatial.tileWidth)  | 0
  const ty = ((wy - spatial.originY) / spatial.tileHeight) | 0
  return getTileInfo(map, tx, ty)
}

/**
 * Convenience: return the `TileInfo` for whatever tile a screen-pixel position falls on,
 * accounting for the camera offset and grid origin.
 * Returns `null` when out of bounds.
 * @param map     The tile map.
 * @param spatial World-to-grid mapping config.
 * @param cameraX Camera world X (scroll offset).
 * @param cameraY Camera world Y (scroll offset).
 * @param sx      Screen X in pixels.
 * @param sy      Screen Y in pixels.
 * @example
 * // Mouse click → tile lookup
 * const tile = getTileAtScreen(map, spatial, camera.x, camera.y, mouseX, mouseY)
 */
export const getTileAtScreen = <T>(
  map: TileMap<T>,
  spatial: SpatialConfig,
  cameraX: number,
  cameraY: number,
  sx: number,
  sy: number
): TileInfo<T> | null => {
  const tx = ((sx + cameraX - spatial.originX) / spatial.tileWidth)  | 0
  const ty = ((sy + cameraY - spatial.originY) / spatial.tileHeight) | 0
  return getTileInfo(map, tx, ty)
}

// --- default export ---

export default {
  TileFlags,
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
}
