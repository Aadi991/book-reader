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

// ── JDK auto-detection ────────────────────────────────────────────
// Gradle/Android build tools require JDK 17-21. Detect a suitable JDK
// automatically so `npm run build:mobile` works without manual env setup.
function findJdk17() {
  const candidates = [
    'D:\\Android\\openjdk\\jdk-17.0.12',
    'D:\\Android\\Studio\\jbr',
    process.env.JAVA_HOME,
    // Common CI/CD paths
    '/usr/lib/jvm/java-17-openjdk-amd64',
    '/usr/lib/jvm/temurin-17',
  ]
  for (const p of candidates) {
    if (!p) continue
    const javaExe = process.platform === 'win32'
      ? path.join(p, 'bin', 'java.exe')
      : path.join(p, 'bin', 'java')
    if (fs.existsSync(javaExe)) {
      console.log('[build-apk] Using JDK:', p)
      return p
    }
  }
  console.warn('[build-apk] ⚠️  Could not find a JDK 17 installation. Gradle may fail if JAVA_HOME points to an incompatible version.')
  return null
}

const jdkPath = findJdk17()
if (jdkPath) {
  process.env.JAVA_HOME = jdkPath
  const binDir = path.join(jdkPath, 'bin')
  const sep = process.platform === 'win32' ? ';' : ':'
  process.env.PATH = binDir + sep + (process.env.PATH || '')
}

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
