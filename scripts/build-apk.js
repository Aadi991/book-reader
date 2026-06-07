/**
 * scripts/build-apk.js
 *
 * Builds the Android APK via Gradle and copies it to build/mobile/.
 *
 * Usage (after `npm run cap:sync`):
 *   node scripts/build-apk.js
 *
 * In CI, use: npm run build:mobile
 * which runs: vite build && npx cap sync android && node scripts/build-apk.js
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const ANDROID_DIR = path.join(ROOT, 'android')
const OUTPUT_DIR = path.join(ROOT, 'build', 'mobile')

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true })

console.log('[build-apk] Running Gradle assembleDebug...')

try {
  // Run Gradle build
  const gradleCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew'
  execSync(`${gradleCmd} assembleDebug`, {
    cwd: ANDROID_DIR,
    stdio: 'inherit',
    shell: true,
  })

  // Find the generated APK
  const apkSource = path.join(
    ANDROID_DIR,
    'app',
    'build',
    'outputs',
    'apk',
    'debug',
    'app-debug.apk'
  )

  if (!fs.existsSync(apkSource)) {
    throw new Error(`APK not found at expected path: ${apkSource}`)
  }

  // Copy to build/mobile/ with a friendly name
  const pkg = require('../package.json')
  const version = pkg.version || '1.0.0'
  const destName = `book-reader-${version}-debug.apk`
  const dest = path.join(OUTPUT_DIR, destName)

  fs.copyFileSync(apkSource, dest)
  console.log(`[build-apk] ✅ APK ready at: build/mobile/${destName}`)
} catch (err) {
  console.error('[build-apk] ❌ Build failed:', err.message)
  process.exit(1)
}
