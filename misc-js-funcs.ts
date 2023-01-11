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

export {
  sleep,
  chunkArray,
  settledSeparator
}

export default {
  sleep,
  chunkArray,
  settledSeparator
}