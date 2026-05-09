import { build } from 'esbuild'
import { execSync } from 'child_process'
import { rmSync, mkdirSync } from 'fs'

// Clean dist
rmSync('dist', { recursive: true, force: true })
mkdirSync('dist')

const shared = {
  entryPoints: ['index.ts'],
  bundle: true,
  platform: 'node',
  // AWS SDK is optional peer dep — don't bundle it
  external: ['@aws-sdk/client-s3'],
  sourcemap: true,
}

await Promise.all([
  build({ ...shared, format: 'esm', outfile: 'dist/index.mjs' }),
  build({ ...shared, format: 'cjs', outfile: 'dist/index.cjs' }),
])

// Emit .d.ts files via tsc (esbuild strips types)
execSync('npx tsc --project tsconfig.json', { stdio: 'inherit' })

console.log('Build complete → dist/')
