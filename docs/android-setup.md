# One-time Android Setup

Before `npm run build:mobile` works, you need to scaffold the Capacitor Android
project. This only needs to be done **once** per machine / clone.

## Prerequisites

1. **Java 17 or 21 (LTS)** — download from https://adoptium.net  
   *Note: Gradle and Android build tools do not yet support Java 26. Please install JDK 17 or 21.*  
   Verify: `java -version`

2. **Android Studio** (or just Android SDK command-line tools)  
   Download: https://developer.android.com/studio  
   After install, open Android Studio → SDK Manager → install:
   - Android SDK Platform 34
   - Android SDK Build-Tools 34.0.0

3. Set the `ANDROID_HOME` environment variable (adjust the path if you installed your Android SDK in a custom location like `D:\Android\sdk`):
   ```powershell
   # Windows (PowerShell, permanent)
   [Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
   ```

## One-time Capacitor Init

```bash
# From the project root:
npx cap add android
```

This creates the `android/` folder. Commit it to git (it only changes when you
run `cap sync` after adding new Capacitor plugins).

## Daily workflow

```bash
# Full build → APK in build/mobile/
npm run build:mobile

# Or step by step:
npm run build:web       # Vite build → dist/
npx cap sync android    # copy dist/ into android/app/src/main/assets/public/
node scripts/build-apk  # Gradle build → build/mobile/*.apk
```

## Running on a device / emulator (no APK needed)

```bash
npx cap run android     # requires a connected device or running emulator
```

## APK location after build

```
build/
└── mobile/
    └── book-reader-1.0.0-debug.apk
```
