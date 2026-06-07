import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.bookreader.mobile',
  appName: 'Book Reader',
  webDir: 'dist',
  // Point at the Vite dev server when running `npx cap run android --external`
  server: {
    androidScheme: 'https',
  },
  android: {
    // APK goes into build/mobile/ via the Gradle buildDir override in build-apk.js
    buildOptions: {
      keystorePath: undefined,   // unsigned for now
      releaseType: 'APK',
    },
  },
  plugins: {
    // Capacitor plugins can be configured here
  },
}

export default config
