/**
 * electron/electron-builder.config.js
 *
 * electron-builder configuration for the Book Reader desktop app.
 *
 * Output: build/desktop/
 *
 * Windows target: "portable" — a single self-contained .exe that
 * runs without installation. No registry writes, no admin rights needed.
 * Note: unsigned portables show a SmartScreen "unknown publisher" prompt
 * on first run on any new machine. Users click "More info → Run anyway".
 * Full removal of SmartScreen requires a paid EV code-signing certificate.
 */

/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: 'com.bookreader.desktop',
  productName: 'Book Reader',
  npmRebuild: false,

  // All built assets come from the Vite build output
  directories: {
    buildResources: 'public',
    output: 'build/desktop',
  },

  // Files that go into the Electron package
  files: [
    'dist/**/*',         // Vite build output
    'electron/**/*',     // main.js + preload.js
    'package.json',
  ],

  // Tell electron-builder where the main process entry is
  extraMetadata: {
    main: 'electron/main.js',
  },

  win: {
    target: [
      {
        // portable = single .exe, no installer, no admin rights
        target: 'portable',
        arch: ['x64'],
      },
    ],
    // Leave artifactName unset → defaults to "${productName} ${version}.exe"
  },

  // macOS (for future reference)
  mac: {
    target: [{ target: 'dmg', arch: ['x64', 'arm64'] }],
    category: 'public.app-category.books',
  },

  // Linux (for future reference)
  linux: {
    target: [{ target: 'AppImage', arch: ['x64'] }],
    category: 'Office',
  },
}
