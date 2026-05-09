import * as s3 from './s3'
export * from './s3'
import JSONL from './jsonl'
import * as jsMisc from './misc-js-funcs'
export * from './misc-js-funcs'
import tileMap from './tile-map'
export * from './tile-map'

export {
  s3,
  JSONL,
  tileMap
}

export default {
  s3,
  JSONL,
  tileMap,
  utils: {
    ...jsMisc
  }
}
