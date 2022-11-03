/**
 * made fairly specifically for arrays when dealing with larger qunatities of data that you may need to concat later
 */

export default {
  stringify: (data: any[]): string => {
    return data.map((d) => JSON.stringify(d)).join(EOL);
  },

  parse: (data: string): any[] => {
    return data.split(EOL).map((d, i) => {
      try{
        return JSON.parse(d);
      } catch (e: any) {
        console.error('Could not parse JSONL on line: ' + i, { error: e.message, line: i });
      }
    });
  },
}
  
