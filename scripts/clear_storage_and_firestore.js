#!/usr/bin/env node
/**
 * Helper script to clear Supabase storage buckets and Firestore collections.
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... FIREBASE_SERVICE_ACCOUNT=./sa.json node scripts/clear_storage_and_firestore.js --yes
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT || null
const CONFIRM = process.argv.includes('--yes')

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

if (!CONFIRM) {
  console.log('This will DELETE all objects in buckets: Covers, Books and (optionally) remove all documents in Firestore collection `books`.')
  console.log('Run with --yes to confirm. Set FIREBASE_SERVICE_ACCOUNT to a service account JSON path to also clear Firestore.')
  process.exit(0)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function clearBucket(bucket) {
  console.log(`Clearing Supabase bucket: ${bucket}`)
  // list all objects (paginated)
  let list = []
  const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1000 })
  if (error) {
    console.error('List error', error)
    return
  }
  if (Array.isArray(data) && data.length > 0) {
    const names = data.map((d) => d.name)
    const { error: rmErr } = await supabase.storage.from(bucket).remove(names)
    if (rmErr) console.error('Remove error', rmErr)
    else console.log(`Removed ${names.length} objects from ${bucket}`)
  } else {
    console.log(`No objects found in ${bucket}`)
  }
}

async function clearFirestore() {
  if (!FIREBASE_SERVICE_ACCOUNT || !fs.existsSync(FIREBASE_SERVICE_ACCOUNT)) {
    console.log('No FIREBASE_SERVICE_ACCOUNT provided — skipping Firestore clear')
    return
  }
  console.log('Clearing Firestore collection: books')
  const sa = JSON.parse(fs.readFileSync(FIREBASE_SERVICE_ACCOUNT, 'utf8'))
  const admin = (await import('firebase-admin')).default
  admin.initializeApp({ credential: admin.credential.cert(sa) })
  const db = admin.firestore()
  const col = db.collection('books')
  const snapshot = await col.get()
  const batch = db.batch()
  snapshot.forEach((doc) => batch.delete(doc.ref))
  await batch.commit()
  console.log(`Deleted ${snapshot.size} documents from books`)
}

async function run() {
  await clearBucket('Covers')
  await clearBucket('Books')
  await clearFirestore()
  console.log('Done')
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
