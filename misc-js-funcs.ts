const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const chunkArray = (source: Array<any>, chunkSize: number = 10) => {
  const chunks = source.reduce((resultArray, item, index) => { 
    const chunkIndex = Math.floor(index/chunkSize)
  
    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []
    }
  
    resultArray[chunkIndex].push(item)
  
    return resultArray
  }, [])
  return chunks
}

const settledSeparator = (result: Array<PromiseSettledResult<any>>) => {
  const settled = result.filter((r) => r.status === 'fulfilled')
  const rejected = result.filter((r) => r.status === 'rejected')
  return { settled, rejected, total: result.length }
}
  
const timeFormat = (ms: number) => {
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)} secs`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)} mins`;
  return `${(ms / 3600000).toFixed(2)} hrs`;
}
                   
const timeSinceString = (ms: number) => {
  return timeFormat(Date.now() - ms);
}

export {
  sleep,
  chunkArray,
  settledSeparator,
  timeFormat,
  timeSinceString
}

export default {
  sleep,
  chunkArray,
  settledSeparator,
  timeFormat,
  timeSinceString
}
