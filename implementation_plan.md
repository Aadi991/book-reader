# Book Reader — Offline-First Persistence, Electron & React Native Build Pipeline

## Background

The project is a Vite + React PDF reader backed by Firebase Auth + Firestore (metadata) and Supabase Storage (PDFs). Currently:
- Repositories hit Firestore/Supabase directly on every call — no caching, no offline support
- `ProgressRepository` queues no writes when offline; syncing is fire-and-forget
- There is no Electron or React Native build pipeline
- No GitHub Actions pipeline exists

This plan adds:
1. A **`LocalPersistenceService`** (IndexedDB-backed) as a standalone cache layer
2. **Offline sync queue** for progress writes that replays on reconnection
3. Repository upgrades to be **cache-first** (read cache → fallback Firestore; write cache + Firestore)
4. **Electron wrapper** producing a signed `.exe` at `build/desktop/`
5. **React Native / Expo app** producing a `.apk` at `build/mobile/`
6. **GitHub Actions CI/CD** for both targets, distributing via Firebase App Distribution

---

## Open Questions

> [!IMPORTANT]
> **Q1 — React Native scope:** Do you want a fully-featured RN app (separate `mobile/` package in this repo) or a stub Expo project wired up with the same Firebase config? The mobile PDF rendering is complex — should it use a native PDF viewer (e.g. `react-native-pdf`) or a WebView wrapping the existing reader?

> [!IMPORTANT]
> **Q2 — Electron signing:** For Windows `.exe` distribution you need a code-signing certificate. Should the pipeline produce an **unsigned** installer for now (which triggers SmartScreen warnings) or skip signing and use a portable `.exe`?

> [!IMPORTANT]
> **Q3 — Firebase App Distribution target:** App Distribution works well for Android APKs. For the desktop `.exe`, should the pipeline upload to **GitHub Releases** instead (Firebase App Distribution only supports Android/iOS)?

> [!NOTE]
> **Q4 — idb library:** The plan uses the `idb` npm package (tiny IndexedDB wrapper). This is the standard approach for Vite/React. Confirm this is acceptable (vs. a raw `indexedDB` implementation or Dexie.js).

---

## Proposed Changes

### 1 — New: Local Persistence Layer (`src/data/persistence/`)

The persistence layer is **completely separate** from the Firestore library. It owns the local truth and never imports Firebase directly.

#### [NEW] `src/data/persistence/LocalDB.js`
Initialises a versioned IndexedDB database called `book-reader-db` with the following object stores:
- `books` — cached book metadata
- `series` — cached series + volumes
- `progress` — reading progress (local authority, synced to Firestore)
- `settings` — user settings
- `syncQueue` — pending writes to replay when online (`{ collection, id, payload, retries, createdAt }`)

Uses the `idb` library. Works identically in both the Vite browser build and Electron (Electron exposes a real browser runtime).

#### [NEW] `src/data/persistence/LocalPersistenceService.js`
High-level CRUD wrapper over `LocalDB`. Public API:
```js
// Object-level persistence (IndexedDB)
getBooks()
putBooks(books)
getBook(id)
putBook(book)
getSeries()
putSeries(series)
getSeriesById(id)
putSeriesById(series)
getProgress(userId, bookId)      // key = `${userId}_${bookId}`
putProgress(userId, bookId, data)
getSettings(userId)
putSettings(userId, data)

// Sync queue
enqueueWrite({ collection, id, payload })
dequeueAll()
clearQueue()
```

This service has **zero Firebase/Supabase imports**. It is the pure local state layer.

#### [NEW] `src/data/persistence/OfflineSyncService.js`
Listens for `online` events on `window` (and Firestore network status) and drains the `syncQueue`:
```js
startListening()    // sets up window.addEventListener('online', flush)
stopListening()
flush()             // reads all queued writes → calls FirestoreService.set() for each → clears on success
```

Progress writes that fail (network error) are re-queued with an incremented retry counter (max 5). Exponential back-off via `setTimeout`.

---

### 2 — Updated Repositories (`src/data/`)

All repositories adopt a **cache-first** pattern. The distinction is:
- **Object persistence** (IndexedDB via `LocalPersistenceService`) → always fast, always available
- **Firestore library persistence** → network-dependent, source of truth for cross-device sync

#### [MODIFY] [BookRepository.js](file:///d:/React/Apps/Projects/book-reader/src/data/BookRepository.js)
- `getAllBooks()` → returns `LocalPersistenceService.getBooks()` if cache is warm; hydrates from Firestore and populates cache otherwise
- `get(id)` → cache hit first, Firestore miss
- `add/update/delete` → writes to Firestore, invalidates local cache entry

#### [MODIFY] [ProgressRepository.js](file:///d:/React/Apps/Projects/book-reader/src/data/ProgressRepository.js)
This is the **most important** change:
- `getProgress(userId, bookId)` → reads from IndexedDB first
- `setProgress(userId, bookId, data)` → **always** writes to IndexedDB immediately, then:
  - If `navigator.onLine` → also writes to Firestore via `FirestoreService.set()`
  - If offline → calls `OfflineSyncService.enqueueWrite({ collection: 'progress', id, payload })`
- `listForUser(userId)` → reads from IndexedDB (no full-collection Firestore scan)

#### [MODIFY] [SeriesRepository.js](file:///d:/React/Apps/Projects/book-reader/src/data/SeriesRepository.js)
- Unify static/instance pattern (currently mixes both)
- `getAllSeries()` → cache first, Firestore fallback, populates cache
- `get(seriesId)` → cache first, Firestore miss + populate

#### [MODIFY] [SettingsRepository.js](file:///d:/React/Apps/Projects/book-reader/src/data/SettingsRepository.js)
- `get(userId)` → IndexedDB first, Firestore fallback
- `set(userId, data)` → write IndexedDB + Firestore (online) / queue (offline)

---

### 3 — Electron Desktop App (`electron/`)

A thin Electron host that loads the Vite-built app. All React code stays unchanged; Electron simply wraps it.

#### [NEW] `electron/main.js`
Main process: creates `BrowserWindow`, loads `dist/index.html` in production or `http://localhost:5173` in dev. Enables `contextIsolation`, `webSecurity`. Registers IPC handlers for native file ops if needed later.

#### [NEW] `electron/preload.js`
Exposes a minimal `electronAPI` to the renderer via `contextBridge` (platform info, app version). No `nodeIntegration` in renderer.

#### [NEW] `electron/electron-builder.config.js`
```js
{
  appId: "com.bookreader.app",
  productName: "Book Reader",
  directories: { output: "build/desktop" },
  win: { target: [{ target: "nsis", arch: ["x64"] }] },
  nsis: { oneClick: false, allowToChangeInstallationDirectory: true }
}
```

#### [MODIFY] [package.json](file:///d:/React/Apps/Projects/book-reader/package.json)
Add scripts:
```json
"dev:electron": "concurrently \"vite\" \"wait-on http://localhost:5173 && electron electron/main.js\"",
"build:desktop": "vite build && electron-builder --config electron/electron-builder.config.js",
"build:desktop:ci": "vite build && electron-builder --config electron/electron-builder.config.js --publish never"
```
Add dev deps: `electron`, `electron-builder`, `concurrently`, `wait-on`

#### [MODIFY] [vite.config.js](file:///d:/React/Apps/Projects/book-reader/vite.config.js)
Add `base: './'` for relative asset paths so Electron can load `file://` protocol correctly.

---

### 4 — React Native / Expo Mobile App (`mobile/`)

A separate Expo managed-workflow project living in `mobile/`. Shares the same Firebase project and Supabase credentials. Produces `.apk` via EAS Build or local Expo build.

#### [NEW] `mobile/` — Expo project (created via `create-expo-app`)
Key screens mirroring the web app:
- `LoginScreen` — Firebase Auth (Google + Email)
- `LibraryScreen` — Series/Books grid
- `ReaderScreen` — PDF viewer via `react-native-pdf`
- `SettingsScreen`

#### [NEW] `mobile/src/data/` — Shared data contracts
The mobile app gets its own repository implementations that use `@react-native-async-storage/async-storage` as the local persistence layer (IndexedDB isn't available in RN). The same `OfflineSyncService` logic is reimplemented targeting AsyncStorage.

#### [NEW] `mobile/scripts/build-apk.sh`
```bash
#!/bin/bash
cd mobile
npx eas build --platform android --profile preview --local --output ../build/mobile/book-reader.apk
```

---

### 5 — GitHub Actions Pipeline (`.github/workflows/`)

#### [NEW] `.github/workflows/build-desktop.yml`
Trigger: `push` to `main` or manual `workflow_dispatch`
Steps:
1. `checkout`
2. `setup-node` (Node 20)
3. `npm ci`
4. Inject env vars from GitHub Secrets
5. `npm run build:desktop:ci`
6. Upload artifact `build/desktop/*.exe` to GitHub Release (via `softproj/action-gh-release`)

#### [NEW] `.github/workflows/build-mobile.yml`
Trigger: `push` to `main` or manual `workflow_dispatch`
Steps:
1. `checkout`
2. `setup-node` (Node 20)
3. `npm ci` inside `mobile/`
4. Install EAS CLI
5. `eas build --platform android --profile preview --non-interactive`
6. Download built APK artifact
7. Upload APK to **Firebase App Distribution** via `wzieba/Firebase-Distribution-Github-Action`

Required GitHub Secrets:
```
FIREBASE_APP_ID_ANDROID
FIREBASE_TOKEN
GOOGLE_SERVICES_JSON (base64 encoded)
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
EXPO_TOKEN
```

---

## Architecture Diagram (After)

```
┌─────────────────────────────────────────────────────┐
│                   Application Layer                  │
│  useReadingHistory / useLibrary / useSeries / etc.   │
└──────────────────────┬──────────────────────────────┘
                       │
         ┌─────────────▼──────────────┐
         │       Repositories         │
         │  (cache-first logic here)  │
         └──┬──────────────────┬──────┘
            │                  │
    ┌───────▼──────┐   ┌───────▼────────────┐
    │ LocalPersist │   │ FirestoreService    │
    │ Service      │   │ (online only)       │
    │ (IndexedDB)  │   └────────────────────┘
    └──────┬───────┘
           │
    ┌──────▼────────────┐
    │ OfflineSyncService│
    │ (queue → Firestore│
    │  on reconnect)    │
    └───────────────────┘
```

---

## Verification Plan

### Automated Tests
- None currently exist; no test suite to run.

### Manual Verification
1. **Persistence**: Open app, load library, go offline (DevTools → Network: Offline), reload page — books/series must load from IndexedDB.
2. **Progress sync**: Go offline, read to page 50, close. Come back online — verify Firestore document updated within seconds.
3. **Electron**: Run `npm run dev:electron`, verify app opens in Electron window. Run `npm run build:desktop`, verify `build/desktop/*.exe` exists and installs.
4. **GitHub Actions**: Push to `main`, verify both workflows trigger and artifacts are uploaded.
