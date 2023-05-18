import * as s3 from './s3'
import JSONL from './jsonl'
import * as jsMisc from './misc-js-funcs'

export {
  s3,
  JSONL,
  ...jsMisc
}

export default {
  s3,
  JSONL,
  utils: {
    ...jsMisc
  }
}
