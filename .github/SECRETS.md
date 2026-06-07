# GitHub Actions — Required Secrets
# ====================================
# Go to: Settings → Secrets and variables → Actions → New repository secret
#
# Add each of the following:

# ─── Firebase (Web App) ──────────────────────────────────────────────────────
# VITE_FIREBASE_API_KEY          = Your Firebase API key
# VITE_FIREBASE_AUTH_DOMAIN      = your-project.firebaseapp.com
# VITE_FIREBASE_PROJECT_ID       = your-project-id
# VITE_FIREBASE_APP_ID           = 1:xxx:web:xxx
# VITE_FIREBASE_MESSAGING_SENDER_ID = 1234567890

# ─── Supabase ────────────────────────────────────────────────────────────────
# VITE_SUPABASE_URL              = https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY         = your-anon-key

# ─── Firebase App Distribution (Android only) ────────────────────────────────
# FIREBASE_APP_ID_ANDROID        = 1:xxx:android:xxx
#   Found in: Firebase Console → Project Settings → Your apps → App ID
#
# FIREBASE_SERVICE_ACCOUNT_JSON  = (paste the full JSON content of a service account key)
#   Created at: Google Cloud Console → IAM → Service Accounts
#   Role needed: Firebase App Distribution Admin
#   Download the JSON key and paste its entire content as the secret value

# ─── GitHub token (auto-provided) ────────────────────────────────────────────
# GITHUB_TOKEN is provided automatically by GitHub Actions — no setup needed.
# It is used to create GitHub Releases for the .exe.

# ─── How to trigger builds ───────────────────────────────────────────────────
# Every push to main  → builds both desktop and mobile, uploads as artifacts
# Push a version tag  → also creates a GitHub Release with the .exe attached
#   git tag v1.0.0
#   git push origin v1.0.0
